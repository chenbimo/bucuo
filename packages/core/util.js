/**
 * Bunpi 工具函数 - 使用 Bun 专属 API
 */

import { file, write } from 'bun';
import path from 'path';
import { Code } from './config/code.js';

/**
 * 确保目录存在
 */
export const ensureDir = async (dirPath) => {
    try {
        // 尝试在目录中写入一个临时文件来确保目录存在
        const testFile = file(path.join(dirPath, '.bunpi-temp'));
        await write(testFile, '');
        // 删除临时文件
        await write(testFile, null);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * 生成UUID
 */
export const uuid = () => {
    return crypto.randomUUID();
};

/**
 * SHA256 哈希 - 使用 Bun 的 crypto
 */
export const sha256 = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * MD5` 哈希 - 使用 Bun 的 Hasher
 */
export function md5(str) {
    const hasher = new Bun.CryptoHasher('md5');
    hasher.update(str);
    return hasher.digest('hex');
}

/**
 * 合并对象
 */
export const merge = (target, ...sources) => {
    for (const source of sources) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {};
                }
                merge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
};

/**
 * 格式化日期
 */
export const formatDate = (date = new Date(), format = 'YYYY-MM-DD HH:mm:ss') => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    const second = String(d.getSeconds()).padStart(2, '0');

    return format.replace('YYYY', year).replace('MM', month).replace('DD', day).replace('HH', hour).replace('mm', minute).replace('ss', second);
};

/**
 * 获取客户端IP
 */
export const getClientIP = (request) => {
    const headers = request.headers;
    return headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || headers.get('x-client-ip') || 'unknown';
};

/**
 * 解析请求信息
 */
export const parseRequest = (request) => {
    const url = new URL(request.url);
    return {
        method: request.method,
        url: request.url,
        pathname: url.pathname,
        search: url.search,
        query: Object.fromEntries(url.searchParams),
        headers: Object.fromEntries(request.headers),
        userAgent: request.headers.get('user-agent'),
        ip: getClientIP(request),
        timestamp: new Date().toISOString()
    };
};

/**
 * 数据类型判断工具函数
 * @param {any} value - 要判断的值
 * @param {string} type - 要判断的类型名称
 * @returns {boolean} 判断结果
 */
export function isType(value, type) {
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
}

// 扩展方法，提供更多便捷的类型判断
// is.string = (value) => is(value, 'string');
// is.number = (value) => is(value, 'number');
// is.boolean = (value) => is(value, 'boolean');
// is.array = (value) => is(value, 'array');
// is.object = (value) => is(value, 'object');
// is.function = (value) => is(value, 'function');
// is.null = (value) => is(value, 'null');
// is.undefined = (value) => is(value, 'undefined');
// is.date = (value) => is(value, 'date');
// is.regexp = (value) => is(value, 'regexp');
// is.error = (value) => is(value, 'error');
// is.symbol = (value) => is(value, 'symbol');
// is.bigint = (value) => is(value, 'bigint');
// is.nan = (value) => is(value, 'nan');
// is.empty = (value) => is(value, 'empty');
// is.integer = (value) => is(value, 'integer');
// is.float = (value) => is(value, 'float');
// is.positive = (value) => is(value, 'positive');
// is.negative = (value) => is(value, 'negative');
// is.zero = (value) => is(value, 'zero');
// is.truthy = (value) => is(value, 'truthy');
// is.falsy = (value) => is(value, 'falsy');
// is.primitive = (value) => is(value, 'primitive');
// is.reference = (value) => is(value, 'reference');

// 使用示例：
// console.log(is(123, 'number')); // true
// console.log(is('hello', 'string')); // true
// console.log(is([], 'array')); // true
// console.log(is({}, 'object')); // true
// console.log(is(null, 'null')); // true
// console.log(is(undefined, 'undefined')); // true
// console.log(is(3.14, 'float')); // true
// console.log(is(42, 'integer')); // true
// console.log(is('', 'empty')); // true

// 或者使用扩展方法：
// console.log(is.string('hello')); // true
// console.log(is.number(123)); // true
// console.log(is.array([])); // true
// console.log(is.empty('')); // true
