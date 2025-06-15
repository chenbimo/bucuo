/**
 * Bunfly 工具函数 - 使用 Bun 专属 API
 */

import { file, write } from 'bun';
import path from 'path';

/**
 * 读取目录 - 使用 Bun 原生 API
 */
export async function readDir(dirPath) {
    try {
        // 使用 Bun.Glob 与正确的 cwd 选项
        const glob = new Bun.Glob('*');
        const entries = [];

        // 扫描指定目录
        for await (const entry of glob.scan({ cwd: dirPath, onlyFiles: false })) {
            entries.push(entry);
        }

        return entries;
    } catch (error) {
        console.warn(`读取目录失败 ${dirPath}:`, error.message);
        return [];
    }
}

/**
 * 确保目录存在
 */
export async function ensureDir(dirPath) {
    try {
        // 尝试在目录中写入一个临时文件来确保目录存在
        const testFile = file(path.join(dirPath, '.bunfly-temp'));
        await write(testFile, '');
        // 删除临时文件
        await write(testFile, null);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * 生成UUID
 */
export function uuid() {
    return crypto.randomUUID();
}

/**
 * SHA256 哈希 - 使用 Bun 的 crypto
 */
export async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * MD5 哈希 - 使用 Bun 的 Hasher
 */
export function md5(str) {
    const hasher = new Bun.CryptoHasher('md5');
    hasher.update(str);
    return hasher.digest('hex');
}

/**
 * 获取嵌套对象属性
 */
export function getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * 设置嵌套对象属性
 */
export function setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
        if (!(key in current)) {
            current[key] = {};
        }
        return current[key];
    }, obj);
    target[lastKey] = value;
}

/**
 * 合并对象
 */
export function merge(target, ...sources) {
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
}

/**
 * 格式化日期
 */
export function formatDate(date = new Date(), format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    const second = String(d.getSeconds()).padStart(2, '0');

    return format.replace('YYYY', year).replace('MM', month).replace('DD', day).replace('HH', hour).replace('mm', minute).replace('ss', second);
}

/**
 * 获取客户端IP
 */
export function getClientIP(request) {
    const headers = request.headers;
    return headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || headers.get('x-client-ip') || 'unknown';
}

/**
 * 解析请求信息
 */
export function parseRequest(request) {
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
}
