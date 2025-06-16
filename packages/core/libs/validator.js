/**
 * 新版验证器
 * @param {Object} data - 要验证的数据对象，如 {limit: 10, title: '这是标题'}
 * @param {Object} rules - 验证规则对象，如 {"limit": "每页数量,number,1,100", "title": "标题,string,1,200"}
 * @param {Array} required - 必传字段数组，如 ['limit', 'title']
 * @returns {Object} { code: 0|1, fields: {} }
 */
export function validate(data, rules, required = []) {
    const result = {
        code: 0,
        fields: {}
    };

    // 参数检查
    if (!data || typeof data !== 'object') {
        result.code = 1;
        result.fields._error = '数据必须是对象格式';
        return result;
    }

    if (!rules || typeof rules !== 'object') {
        result.code = 1;
        result.fields._error = '验证规则必须是对象格式';
        return result;
    }

    if (!Array.isArray(required)) {
        result.code = 1;
        result.fields._error = '必传字段必须是数组格式';
        return result;
    }

    // 先检查必传字段
    for (const fieldName of required) {
        if (!(fieldName in data) || data[fieldName] === undefined || data[fieldName] === null || data[fieldName] === '') {
            result.code = 1;
            const ruleParts = rules[fieldName]?.split(',') || [];
            const fieldLabel = ruleParts[0] || fieldName;
            result.fields[fieldName] = `${fieldLabel}为必填项`;
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
    if (!rule || typeof rule !== 'string') {
        return `字段 ${fieldName} 的验证规则格式错误`;
    }

    const parts = rule.split(',');
    if (parts.length < 4) {
        return `字段 ${fieldName} 的验证规则参数不足`;
    }

    const [name, type, minStr, maxStr, regex, separator] = parts;
    const min = parseInt(minStr) || 0;
    const max = parseInt(maxStr) || 0;

    switch (type.toLowerCase()) {
        case 'number':
            return validateNumber(value, name, min, max, fieldName);
        case 'string':
            return validateString(value, name, min, max, regex, fieldName);
        case 'array':
            return validateArray(value, name, min, max, regex, separator === 'null' ? ',' : separator, fieldName);
        default:
            return `字段 ${fieldName} 的类型 ${type} 不支持`;
    }
}

/**
 * 验证数字类型
 */
function validateNumber(value, name, min, max, fieldName) {
    const num = Number(value);
    if (isNaN(num)) {
        return `${name || fieldName}必须是数字`;
    }

    if (num < min) {
        return `${name || fieldName}不能小于${min}`;
    }

    if (max > 0 && num > max) {
        return `${name || fieldName}不能大于${max}`;
    }

    return null;
}

/**
 * 验证字符串类型
 */
function validateString(value, name, min, max, regex, fieldName) {
    const str = String(value);

    if (str.length < min) {
        return `${name || fieldName}长度不能少于${min}个字符`;
    }

    if (max > 0 && str.length > max) {
        return `${name || fieldName}长度不能超过${max}个字符`;
    }

    if (regex && regex.trim() !== '') {
        try {
            const regExp = new RegExp(regex);
            if (!regExp.test(str)) {
                return `${name || fieldName}格式不正确`;
            }
        } catch (error) {
            return `${name || fieldName}的正则表达式格式错误`;
        }
    }

    return null;
}

/**
 * 验证数组类型
 */
function validateArray(value, name, min, max, regex, separator, fieldName) {
    let arr;
    if (Array.isArray(value)) {
        arr = value;
    } else if (typeof value === 'string') {
        arr = value.split(separator || ',').filter((item) => item.trim() !== '');
    } else {
        return `${name || fieldName}必须是数组或可分割的字符串`;
    }

    if (arr.length < min) {
        return `${name || fieldName}至少需要${min}个元素`;
    }

    if (max > 0 && arr.length > max) {
        return `${name || fieldName}最多只能有${max}个元素`;
    }

    if (regex && regex.trim() !== '') {
        try {
            const regExp = new RegExp(regex);
            for (const item of arr) {
                if (!regExp.test(String(item).trim())) {
                    return `${name || fieldName}中的元素"${item}"格式不正确`;
                }
            }
        } catch (error) {
            return `${name || fieldName}的正则表达式格式错误`;
        }
    }

    return null;
}

// 使用示例：
// const data = { limit: 10, title: '这是标题' };
// const rules = {
//     "limit": "每页数量,number,1,100",
//     "title": "标题,string,1,200"
// };
// const required = ['limit', 'title'];
// const result = validate(data, rules, required);
// console.log(result); // { code: 0, fields: {} }
