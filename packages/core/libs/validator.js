/**
 * 简单验证器
 * 支持 number, string, array 三种数据类型的验证
 */

/**
 * 验证单个字段
 * @param {any} value - 要验证的值
 * @param {string} rule - 验证规则，格式：'type,name,min,max,regex,separator'
 * @param {string} fieldName - 字段名
 * @returns {Object} { success: boolean, error?: string }
 */
function validateField(value, rule, fieldName) {
    if (!rule || typeof rule !== 'string') {
        return { success: false, error: `字段 ${fieldName} 的验证规则格式错误` };
    }

    const parts = rule.split(',');
    if (parts.length < 4) {
        return { success: false, error: `字段 ${fieldName} 的验证规则参数不足` };
    }

    const [type, name, minStr, maxStr, regex, separator] = parts;
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
            return { success: false, error: `字段 ${fieldName} 的类型 ${type} 不支持` };
    }
}

/**
 * 验证数字类型
 * @param {any} value - 值
 * @param {string} name - 字段名称
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {string} fieldName - 字段名
 * @returns {Object}
 */
function validateNumber(value, name, min, max, fieldName) {
    if (value === undefined || value === null) {
        return { success: false, error: `${name || fieldName} 不能为空` };
    }

    const num = Number(value);
    if (isNaN(num)) {
        return { success: false, error: `${name || fieldName} 必须是数字` };
    }

    if (num < min) {
        return { success: false, error: `${name || fieldName} 不能小于 ${min}` };
    }

    if (max > 0 && num > max) {
        return { success: false, error: `${name || fieldName} 不能大于 ${max}` };
    }

    return { success: true };
}

/**
 * 验证字符串类型
 * @param {any} value - 值
 * @param {string} name - 字段名称
 * @param {number} min - 最小长度
 * @param {number} max - 最大长度
 * @param {string} regex - 正则表达式
 * @param {string} fieldName - 字段名
 * @returns {Object}
 */
function validateString(value, name, min, max, regex, fieldName) {
    if (value === undefined || value === null) {
        return { success: false, error: `${name || fieldName} 不能为空` };
    }

    const str = String(value);

    if (str.length < min) {
        return { success: false, error: `${name || fieldName} 长度不能少于 ${min} 个字符` };
    }

    if (max > 0 && str.length > max) {
        return { success: false, error: `${name || fieldName} 长度不能超过 ${max} 个字符` };
    }

    if (regex && regex.trim() !== '') {
        try {
            const regExp = new RegExp(regex);
            if (!regExp.test(str)) {
                return { success: false, error: `${name || fieldName} 格式不正确` };
            }
        } catch (error) {
            return { success: false, error: `${name || fieldName} 的正则表达式格式错误` };
        }
    }

    return { success: true };
}

/**
 * 验证数组类型
 * @param {any} value - 值
 * @param {string} name - 字段名称
 * @param {number} min - 最小元素数量
 * @param {number} max - 最大元素数量
 * @param {string} regex - 正则表达式
 * @param {string} separator - 分隔符
 * @param {string} fieldName - 字段名
 * @returns {Object}
 */
function validateArray(value, name, min, max, regex, separator, fieldName) {
    if (value === undefined || value === null) {
        return { success: false, error: `${name || fieldName} 不能为空` };
    }

    let arr;
    if (Array.isArray(value)) {
        arr = value;
    } else if (typeof value === 'string') {
        arr = value.split(separator || ',').filter((item) => item.trim() !== '');
    } else {
        return { success: false, error: `${name || fieldName} 必须是数组或可分割的字符串` };
    }

    if (arr.length < min) {
        return { success: false, error: `${name || fieldName} 至少需要 ${min} 个元素` };
    }

    if (max > 0 && arr.length > max) {
        return { success: false, error: `${name || fieldName} 最多只能有 ${max} 个元素` };
    }

    if (regex && regex.trim() !== '') {
        try {
            const regExp = new RegExp(regex);
            for (const item of arr) {
                if (!regExp.test(String(item).trim())) {
                    return { success: false, error: `${name || fieldName} 中的元素 "${item}" 格式不正确` };
                }
            }
        } catch (error) {
            return { success: false, error: `${name || fieldName} 的正则表达式格式错误` };
        }
    }

    return { success: true };
}

/**
 * 验证对象
 * @param {Object} data - 要验证的数据对象
 * @param {Object} rules - 验证规则对象
 * @returns {Object} { success: boolean, errors?: Array, data?: Object }
 */
export function validate(data, rules) {
    if (!data || typeof data !== 'object') {
        return { success: false, errors: ['数据必须是对象格式'] };
    }

    if (!rules || typeof rules !== 'object') {
        return { success: false, errors: ['验证规则必须是对象格式'] };
    }

    const errors = [];
    const validatedData = {};

    // 验证每个字段
    for (const [fieldName, rule] of Object.entries(rules)) {
        const value = data[fieldName];
        const result = validateField(value, rule, fieldName);

        if (!result.success) {
            errors.push(result.error);
        } else {
            // 转换数据类型
            const ruleType = rule.split(',')[0].toLowerCase();
            switch (ruleType) {
                case 'number':
                    validatedData[fieldName] = Number(value);
                    break;
                case 'string':
                    validatedData[fieldName] = String(value);
                    break;
                case 'array':
                    if (Array.isArray(value)) {
                        validatedData[fieldName] = value;
                    } else {
                        const separator = rule.split(',')[5];
                        const sep = separator === 'null' ? ',' : separator;
                        validatedData[fieldName] = String(value)
                            .split(sep || ',')
                            .filter((item) => item.trim() !== '');
                    }
                    break;
                default:
                    validatedData[fieldName] = value;
            }
        }
    }

    if (errors.length > 0) {
        return { success: false, errors };
    }

    return { success: true, data: validatedData };
}

/**
 * 创建验证器函数
 * @param {Object} rules - 验证规则
 * @returns {Function} 验证函数
 */
export function createValidator(rules) {
    return function (data) {
        return validate(data, rules);
    };
}
