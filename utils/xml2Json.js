'use strict';

const TOKEN_TYPE = {
    BUILD: {
        COMPTIME: true
    },
    NODE_TYPE: {
        ATTRIBUTE: 'ATTRIBUTE',
        CONTENT: 'CONTENT',
        ELEMENT: 'ELEMENT',
        ROOT: 'ROOT'
    },
    TOKEN_TYPE: {
        OPEN_BRACKET: 'OPEN_BRACKET',
        ELEMENT_TYPE: 'ELEMENT_TYPE',
        CLOSE_ELEMENT: 'CLOSE_ELEMENT',
        ATTRIB_NAME: 'ATTRIB_NAME',
        ATTRIB_VALUE: 'ATTRIB_VALUE',
        ASSIGN: 'ASSIGN',
        CLOSE_BRACKET: 'CLOSE_BRACKET',
        CONTENT: 'CONTENT',
        EOF: 'EOF'
    }
};
// AST Node types
const [ROOT, ELEMENT, ATTRIBUTE, CONTENT] = ['ROOT', 'ELEMENT', 'ATTRIBUTE', 'CONTENT'];

const Token = (type, value) => ({
    type,
    value
});

// lexer.js
const EOF_TOKEN = Token(TOKEN_TYPE.EOF);

const isCharBlank = (char) => char === ' ' || char === '\n' || char === '\r' || char === '\t';

const skipXMLDocumentHeader = (xmlAsString, pos) => {
    if (xmlAsString.startsWith('<?xml', pos)) {
        const len = xmlAsString.length;
        while (pos < len) {
            if (xmlAsString[pos] !== '?') {
                pos++;
            } else if (xmlAsString[pos + 1] === '>') {
                return pos + 2; // skip "?>""
            } else {
                pos++;
            }
        }
    }
    return pos;
};

const replaceQuotes = (str) => str.replace(/'/g, "'");

const getInitialPosForLexer = (xmlAsString) => {
    let pos = 0;
    while (pos < xmlAsString.length && isCharBlank(xmlAsString[pos])) pos++;
    return skipXMLDocumentHeader(xmlAsString, pos);
};

function createLexer(xmlAsString) {
    let currentToken = null;
    let pos = getInitialPosForLexer(xmlAsString);
    let scopingElement = [];

    const peek = () => xmlAsString[pos];
    const hasNext = () => currentToken !== EOF_TOKEN && pos < xmlAsString.length;
    const isBlankSpace = () => isCharBlank(xmlAsString[pos]);

    const skipQuotes = () => {
        if (hasNext() && isQuote(peek())) pos++;
    };

    const isQuote = (char) => '"' === char || "'" === char;

    const skipSpaces = () => {
        while (hasNext() && isBlankSpace()) pos++;
    };

    const readAlphaNumericCharsOrBrackets = (areSpecialCharsSupported) => {
        if (hasNext()) {
            if (xmlAsString[pos] === '<') {
                let buffer = '<';
                pos++;
                if (hasNext() && xmlAsString[pos] === '/') {
                    pos++;
                    buffer = '</';
                } else if (hasNext() && xmlAsString[pos] === '!' && xmlAsString[pos + 1] === '-' && xmlAsString[pos + 2] === '-') {
                    // its a comment
                    pos++;
                    pos++;
                    pos++;
                    buffer = '<!--';
                }
                return buffer;
            } else if (peek() === '/') {
                let buffer = '/';
                pos++;
                if (hasNext() && peek() === '>') {
                    pos++;
                    buffer = '/>';
                }
                return buffer;
            } else if (xmlAsString[pos] === '=' || xmlAsString[pos] === '>') {
                const buffer = xmlAsString[pos];
                pos++;
                return buffer;
            }
        }
        return readAlphaNumericChars(!!areSpecialCharsSupported);
    };

    const readAlphaNumericChars = (areSpecialCharsSupported) => {
        const ELEMENT_TYPE_MATCHER = /[a-zA-Z0-9_:-]/;
        const NAMES_VALS_CONTENT_MATCHER = /[^>=<]/u;
        const matcher = areSpecialCharsSupported ? NAMES_VALS_CONTENT_MATCHER : ELEMENT_TYPE_MATCHER;
        let start = pos;
        while (hasNext() && xmlAsString[pos].match(matcher)) pos++;
        return replaceQuotes(xmlAsString.substring(start, pos));
    };

    const isElementBegin = () => currentToken && currentToken.type === TOKEN_TYPE.OPEN_BRACKET;
    const isAssignToAttribute = () => currentToken && currentToken.type === TOKEN_TYPE.ASSIGN;

    const next = () => {
        const prevPos = pos;
        skipSpaces();
        const numOfSpacesSkipped = pos - prevPos;
        if (!hasNext()) {
            currentToken = EOF_TOKEN;
        } else if (isElementBegin()) {
            // starting new element
            skipSpaces();
            const buffer = readAlphaNumericCharsOrBrackets(false);
            currentToken = Token(TOKEN_TYPE.ELEMENT_TYPE, buffer);
            scopingElement.push(buffer);
        } else if (isAssignToAttribute()) {
            // assign value to attribute
            skipQuotes();
            const openingQuote = xmlAsString[pos - 1];
            let start = pos;
            while (hasNext() && peek() !== openingQuote) pos++;
            const buffer = replaceQuotes(xmlAsString.substring(start, pos));
            pos++;
            currentToken = Token(TOKEN_TYPE.ATTRIB_VALUE, buffer);
        } else {
            skipSpaces();
            let buffer = readAlphaNumericCharsOrBrackets(true);
            switch (buffer) {
                case '=': {
                    if (currentToken.type === TOKEN_TYPE.ATTRIB_NAME) {
                        currentToken = Token(TOKEN_TYPE.ASSIGN);
                    } else {
                        currentToken = Token(TOKEN_TYPE.CONTENT, buffer);
                    }
                    break;
                }
                case '</': {
                    const start = pos;
                    while (xmlAsString[pos] !== '>') pos++;
                    currentToken = Token(TOKEN_TYPE.CLOSE_ELEMENT, xmlAsString.substring(start, pos));
                    pos++; // skip the ">"
                    scopingElement.pop();
                    break;
                }
                case '/>': {
                    const scopingElementName = scopingElement.pop();
                    currentToken = Token(TOKEN_TYPE.CLOSE_ELEMENT, scopingElementName);
                    break;
                }
                case '<!--': {
                    // skipComment contents
                    const closingBuff = ['!', '-', '-'];
                    while (hasNext() && (closingBuff[2] !== '>' || closingBuff[1] !== '-' || closingBuff[0] !== '-')) {
                        closingBuff.shift();
                        closingBuff.push(xmlAsString[pos]);
                        pos++;
                    }
                    return next();
                }
                case '>': {
                    currentToken = Token(TOKEN_TYPE.CLOSE_BRACKET);
                    break;
                }
                case '<': {
                    currentToken = Token(TOKEN_TYPE.OPEN_BRACKET);
                    break;
                }
                default: {
                    // here we fall if we have alphanumeric string, which can be related to attributes, content or nothing
                    if (buffer && buffer.length > 0) {
                        if (currentToken.type === TOKEN_TYPE.CLOSE_BRACKET) {
                            let suffix = '';
                            if (peek() !== '<') {
                                suffix = readAlphaNumericChars(true);
                            }
                            currentToken = Token(TOKEN_TYPE.CONTENT, buffer + suffix);
                        } else if (currentToken.type !== TOKEN_TYPE.ATTRIB_NAME && currentToken.type !== TOKEN_TYPE.CONTENT) {
                            if (currentToken.type === TOKEN_TYPE.CLOSE_ELEMENT) {
                                // we're assuming this is content, part of unstructured data
                                buffer = ' '.repeat(numOfSpacesSkipped) + buffer;
                                currentToken = Token(TOKEN_TYPE.CONTENT, buffer);
                            } else {
                                // it should be an attribute name token
                                currentToken = Token(TOKEN_TYPE.ATTRIB_NAME, buffer);
                            }
                        } else {
                            const contentBuffer = ' '.repeat(numOfSpacesSkipped) + buffer; // spaces included as content
                            currentToken = Token(TOKEN_TYPE.CONTENT, contentBuffer);
                        }
                        break;
                    } else {
                        const errMsg = 'Unknown Syntax : "' + xmlAsString[pos] + '"';
                        throw new Error(errMsg);
                    }
                }
            }
        }

        return currentToken;
    };

    return {
        peek,
        next,
        hasNext,
        // prettier-ignore
        ...(BUILD.COMPTIME
            ? {
                getInitialPosForLexer,
                isAssignToAttribute,
                isBlankSpace,
                isElementBegin,
                isQuote,
                replaceQuotes,
                skipQuotes,
                skipSpaces,
                skipXMLDocumentHeader
            }
            : {})
    };
}

const Node = (type, value) => ({
    type,
    value
});

const ContentNode = (value) => Node(CONTENT, value);

const ElementNode = (type, attributes, children) => {
    return Node(ELEMENT, {
        type,
        attributes,
        children
    });
};

const AttribNode = (name, value) => {
    return Node(ATTRIBUTE, {
        name,
        value
    });
};

const parseXML = (lexer) => {
    /*
    How does the grammar look?
    | expr: StructuredXML | UnstructuredXML | Content
    | StructuredXML: (openBracket + ElementName) + (AttributeList)* + closeBracket + (expr)* + closeElement
    | UnstructuredXML: Content* + expr* + Content*
    | Content: String
    | openBracket: <
    | closeBracket: >
    | closeElement: </ + ElementName + closeBracket
    | ElementName: String
    | AttributeList: AttributeName + "=" + AttributeValue + AttributeList*
    | AttributeName: String
    | AttributeValue: String
    */
    const rootNode = Node(ROOT, {
        children: parseExpr(lexer, Token(ROOT, 'ROOT'))
    });
    return rootNode;
};

const parseExpr = (lexer, scopingElement) => {
    const children = [];
    while (lexer.hasNext()) {
        const lexem = lexer.next();
        switch (lexem.type) {
            case TOKEN_TYPE.OPEN_BRACKET: {
                const elementLexem = lexer.next();
                const [elementAttributes, currentToken] = parseElementAttributes(lexer);
                let elementChildren = [];
                if (currentToken.type !== TOKEN_TYPE.CLOSE_ELEMENT) {
                    elementChildren = parseExpr(lexer, elementLexem);
                }
                if (elementChildren && elementChildren.length > 0 && elementChildren[0].type === TOKEN_TYPE.CONTENT) {
                    elementChildren = reduceChildrenElements(elementChildren);
                }
                children.push(ElementNode(elementLexem.value, elementAttributes, elementChildren));
                break;
            }
            case TOKEN_TYPE.CLOSE_ELEMENT: {
                if (lexem.value === scopingElement.value) return children;
                break;
            }
            case TOKEN_TYPE.CONTENT: {
                children.push(ContentNode(lexem.value));
                break;
            }
            case TOKEN_TYPE.EOF: {
                return children;
            }
            default: {
                throw new Error(`Unknown Lexem type: ${lexem.type} "${lexem.value}, scoping element: ${scopingElement.value}"`);
            }
        }
    }
    return children;
};

const parseElementAttributes = (lexer) => {
    const attribs = [];
    let currentToken = lexer.peek();
    if (!lexer.hasNext() || (currentToken && currentToken.type === TOKEN_TYPE.CLOSE_BRACKET) || (currentToken && currentToken.type === TOKEN_TYPE.CLOSE_ELEMENT)) {
        return [attribs, currentToken];
    }
    currentToken = lexer.next();
    while (lexer.hasNext() && currentToken && currentToken.type !== TOKEN_TYPE.CLOSE_BRACKET && currentToken.type !== TOKEN_TYPE.CLOSE_ELEMENT) {
        const attribName = currentToken;
        lexer.next(); //assignment token
        const attribValue = lexer.next();
        const attributeNode = AttribNode(attribName.value, attribValue.value);
        attribs.push(attributeNode);
        currentToken = lexer.next();
    }
    return [attribs, currentToken];
};

function reduceChildrenElements(elementChildren) {
    let reduced = [],
        buffer = '';

    elementChildren.forEach((child) => {
        if (child.type === TOKEN_TYPE.CONTENT) {
            buffer += child.value;
        } else {
            if (buffer.length) {
                reduced.push(ContentNode(buffer));
                buffer = '';
            }
            reduced.push(child);
        }
    });

    if (buffer.length) reduced.push(ContentNode(buffer));

    return reduced;
}

export const xml2Json = (xmlAsString) => {
    const lexer = createLexer(xmlAsString);
    const ast = parseXML(lexer, xmlAsString);
    return ast;
};
