/**
 * Bunfly 工具函数 - 使用 Bun 专属 API
 */

import { file, write } from 'bun';
import path from 'path';

const util = {
    /**
     * 读取目录 - 使用 Bun 原生 API
     */
    async readDir(dirPath) {
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
    },

    /**
     * 确保目录存在
     */
    async ensureDir(dirPath) {
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
    },

    /**
     * 写入文件
     */
    async writeFile(filePath, content) {
        try {
            const dir = path.dirname(filePath);
            await this.ensureDir(dir);
            await write(file(filePath), content);
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * 读取文件
     */
    async readFile(filePath) {
        try {
            const f = file(filePath);
            if (await f.exists()) {
                return await f.text();
            }
            return null;
        } catch (error) {
            return null;
        }
    },

    /**
     * 检查文件是否存在
     */
    async fileExists(filePath) {
        try {
            return await file(filePath).exists();
        } catch {
            return false;
        }
    },

    /**
     * 生成随机字符串
     */
    randomString(length = 8) {
        return crypto.randomUUID().replace(/-/g, '').substring(0, length);
    },

    /**
     * 生成UUID
     */
    uuid() {
        return crypto.randomUUID();
    },

    /**
     * SHA256 哈希 - 使用 Bun 的 crypto
     */
    async sha256(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    },

    /**
     * MD5 哈希 - 使用 Bun 的 Hasher
     */
    md5(str) {
        const hasher = new Bun.CryptoHasher('md5');
        hasher.update(str);
        return hasher.digest('hex');
    },

    /**
     * Base64 编码
     */
    base64Encode(str) {
        return btoa(str);
    },

    /**
     * Base64 解码
     */
    base64Decode(str) {
        return atob(str);
    },

    /**
     * 获取嵌套对象属性
     */
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    },

    /**
     * 设置嵌套对象属性
     */
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!(key in current)) {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    },

    /**
     * 深度克隆对象
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * 合并对象
     */
    merge(target, ...sources) {
        for (const source of sources) {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key] || typeof target[key] !== 'object') {
                        target[key] = {};
                    }
                    this.merge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    },

    /**
     * 防抖函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 节流函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    /**
     * 延迟函数
     */
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    },

    /**
     * 重试函数
     */
    async retry(fn, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === maxRetries - 1) {
                    throw error;
                }
                await this.sleep(delay);
            }
        }
    },

    /**
     * 格式化日期
     */
    formatDate(date = new Date(), format = 'YYYY-MM-DD HH:mm:ss') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hour = String(d.getHours()).padStart(2, '0');
        const minute = String(d.getMinutes()).padStart(2, '0');
        const second = String(d.getSeconds()).padStart(2, '0');

        return format.replace('YYYY', year).replace('MM', month).replace('DD', day).replace('HH', hour).replace('mm', minute).replace('ss', second);
    },

    /**
     * 解析用户代理
     */
    parseUserAgent(userAgent) {
        const ua = userAgent || '';
        return {
            browser: this.extractBrowser(ua),
            os: this.extractOS(ua),
            device: this.extractDevice(ua),
            raw: ua
        };
    },

    extractBrowser(ua) {
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    },

    extractOS(ua) {
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac OS')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS')) return 'iOS';
        return 'Unknown';
    },

    extractDevice(ua) {
        if (ua.includes('Mobile')) return 'Mobile';
        if (ua.includes('Tablet')) return 'Tablet';
        return 'Desktop';
    },

    /**
     * 验证邮箱
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * 验证URL
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * 生成分页信息
     */
    pagination(total, page = 1, limit = 10) {
        const totalPages = Math.ceil(total / limit);
        const currentPage = Math.max(1, Math.min(page, totalPages));
        const offset = (currentPage - 1) * limit;

        return {
            total,
            page: currentPage,
            limit,
            totalPages,
            offset,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1
        };
    },

    /**
     * 获取客户端IP
     */
    getClientIP(request) {
        const headers = request.headers;
        return headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || headers.get('x-client-ip') || 'unknown';
    },

    /**
     * 解析请求信息
     */
    parseRequest(request) {
        const url = new URL(request.url);
        return {
            method: request.method,
            url: request.url,
            pathname: url.pathname,
            search: url.search,
            query: Object.fromEntries(url.searchParams),
            headers: Object.fromEntries(request.headers),
            userAgent: request.headers.get('user-agent'),
            ip: this.getClientIP(request),
            timestamp: new Date().toISOString()
        };
    }
};

export { util };
