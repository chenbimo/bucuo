import { isType } from '../utils/isType.js';

/**
 * 新版验证器
 * @param {Object} data - 要验证的数据对象，如 {limit: 10, title: '这是标题'}
 * @param {Object} rules - 验证规则对象，如 {"limit": "每页数量,number,1,100", "title": "标题,string,1,200"}
 * @param {Array} required - 必传字段数组，如 ['limit', 'title']
 * @returns {Object} { code: 0|1, fields: {} }
 */
export function Validate(data, rules, required = []) {
    const result = {
        code: 0,
        fields: {},
        error: ''
    };

    // 参数检查
    if (!data || typeof data !== 'object') {
        result.code = 1;
        result.error = '数据必须是对象格式';
        return result;
    }

    if (!rules || typeof rules !== 'object') {
        result.code = 1;
        result.error = '验证规则必须是对象格式';
        return result;
    }

    if (!Array.isArray(required)) {
        result.code = 1;
        result.error = '必传字段必须是数组格式';
        return result;
    }

    // 先检查必传字段
    for (const fieldName of required) {
        if (!(fieldName in data) || data[fieldName] === undefined || data[fieldName] === null || data[fieldName] === '') {
            result.code = 1;
            const ruleParts = rules[fieldName]?.split(',') || [];
            const fieldLabel = ruleParts[0] || fieldName;
            result.fields[fieldName] = `${fieldLabel}(${fieldName})为必填项`;
        }
    }

    // 验证所有在规则中定义的字段
    for (const [fieldName, rule] of Object.entries(rules)) {
        // 如果字段不存在且不是必传字段，跳过验证
        if (!(fieldName in data) && !required.includes(fieldName)) {
            continue;
        }

        // 如果必传验证已经失败，跳过后续验证
        if (result.fields[fieldName]) {
            continue;
        }

        const value = data[fieldName];
        const error = validateFieldValue(value, rule, fieldName);

        if (error) {
            result.code = 1;
            result.fields[fieldName] = error;
        }
    }

    return result;
}

/**
 * 验证单个字段的值
 * @param {any} value - 要验证的值
 * @param {string} rule - 验证规则
 * @param {string} fieldName - 字段名
 * @returns {string|null} 错误信息，验证通过返回 null
 */
function validateFieldValue(value, rule, fieldName) {
    // 只按前4个逗号分隔，后面的都归入第5个参数
    const parts = rule.split(',', 5);

    // 如果有第5个参数，需要重新获取完整的spec部分
    if (rule.split(',').length > 5) {
        const allParts = rule.split(',');
        parts[4] = allParts.slice(4).join(',');
    }
    if (parts.length !== 5) {
        return `字段 ${fieldName} 的验证规则错误，应包含5个部分`;
    }

    const [name, type, minStr, maxStr, specStr] = parts;
    const min = minStr === 'null' ? null : parseInt(minStr) || 0;
    const max = maxStr === 'null' ? null : parseInt(maxStr) || 0;
    const spec = specStr === 'null' ? null : specStr.trim();

    switch (type.toLowerCase()) {
        case 'number':
            return validateNumber(value, name, min, max, spec, fieldName);
        case 'string':
            return validateString(value, name, min, max, spec, fieldName);
        case 'array':
            return validateArray(value, name, min, max, spec, fieldName);
        default:
            return `字段 ${fieldName} 的类型 ${type} 不支持`;
    }
}

function validateNumber(value, name, min, max, spec, fieldName) {
    if (isType(value, 'number') === false) {
        return `${name}(${fieldName})必须是数字`;
    }

    if (min !== null && value < min) {
        return `${name}(${fieldName})不能小于${min}`;
    }

    if (min !== null && max > 0 && value > max) {
        return `${name}(${fieldName})不能大于${max}`;
    }

    if (spec && spec.trim() !== '') {
        try {
            // 按等号分隔等式
            const parts = spec.split('=');
            if (parts.length !== 2) {
                return `${name}(${fieldName})的计算规则必须包含等号`;
            }

            const leftExpression = parts[0].trim();
            const rightValue = parseFloat(parts[1].trim());

            // 验证右边是否为有效数字
            if (isNaN(rightValue)) {
                return `${name}(${fieldName})的计算规则右边必须是数字`;
            }

            // 安全的表达式验证，只允许数字、x、基本运算符和括号
            const safePattern = /^[x\d\+\-\*\/\(\)\.\s]+$/;
            if (!safePattern.test(leftExpression)) {
                return `${name}(${fieldName})的表达式包含不安全的字符`;
            }

            // 将 x 替换为实际值
            let processedExpression = leftExpression.replace(/x/g, value.toString());

            // 使用 Function 构造器安全地计算表达式
            const leftResult = new Function('return ' + processedExpression)();

            if (typeof leftResult !== 'number' || !isFinite(leftResult)) {
                return `${name}(${fieldName})的表达式计算结果不是有效数字`;
            }

            // 比较左边计算结果是否等于右边的数字
            if (Math.abs(leftResult - rightValue) > Number.EPSILON) {
                return `${name}(${fieldName})不满足计算条件 ${spec}`;
            }
        } catch (error) {
            return `${name}(${fieldName})的计算规则格式错误: ${error.message}`;
        }
    }

    return null;
}

/**
 * 验证字符串类型
 */
function validateString(value, name, min, max, spec, fieldName) {
    if (isType(value, 'string') === false) {
        return `${name}(${fieldName})必须是字符串`;
    }

    if (min !== null && value.length < min) {
        return `${name}(${fieldName})长度不能少于${min}个字符`;
    }

    if (max !== null && max > 0 && value.length > max) {
        return `${name}(${fieldName})长度不能超过${max}个字符`;
    }

    if (spec && spec.trim() !== '') {
        try {
            const regExp = new RegExp(spec);
            if (!regExp.test(value)) {
                return `${name}(${fieldName})格式不正确`;
            }
        } catch (error) {
            return `${name}(${fieldName})的正则表达式格式错误`;
        }
    }

    return null;
}

/**
 * 验证数组类型
 */
function validateArray(value, name, min, max, spec, fieldName) {
    if (!Array.isArray(value)) {
        return `${name}(${fieldName})必须是数组`;
    }

    if (min !== null && value.length < min) {
        return `${name}(${fieldName})至少需要${min}个元素`;
    }

    if (max !== null && max > 0 && value.length > max) {
        return `${name}(${fieldName})最多只能有${max}个元素`;
    }

    if (spec && spec.trim() !== '') {
        try {
            const regExp = new RegExp(spec);
            for (const item of value) {
                if (!regExp.test(String(item))) {
                    return `${name}(${fieldName})中的元素"${item}"格式不正确`;
                }
            }
        } catch (error) {
            return `${name}(${fieldName})的正则表达式格式错误`;
        }
    }

    return null;
}
