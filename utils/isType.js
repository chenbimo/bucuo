/**
 * 数据类型判断工具函数
 * @param {any} value - 要判断的值
 * @param {string} type - 要判断的类型名称
 * @returns {boolean} 判断结果
 */
export const isType = (value, type) => {
    const getType = (val) => {
        return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
    };

    const actualType = getType(value);
    const expectedType = type.toLowerCase();

    // 特殊类型处理
    switch (expectedType) {
        case 'null':
            return value === null;
        case 'undefined':
            return value === undefined;
        case 'nan':
            return Number.isNaN(value);
        case 'empty':
            return value === '' || value === null || value === undefined;
        case 'integer':
            return Number.isInteger(value);
        case 'float':
            return typeof value === 'number' && !Number.isInteger(value) && !Number.isNaN(value);
        case 'positive':
            return typeof value === 'number' && value > 0;
        case 'negative':
            return typeof value === 'number' && value < 0;
        case 'zero':
            return value === 0;
        case 'truthy':
            return !!value;
        case 'falsy':
            return !value;
        case 'primitive':
            return value !== Object(value);
        case 'reference':
            return value === Object(value);
        default:
            return actualType === expectedType;
    }
};
