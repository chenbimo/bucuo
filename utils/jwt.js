import { Env } from '../config/env.js';

/**
 * JWT 工具类
 */
export class Jwt {
    static signer = null;
    static verifier = null;
    static initialized = false;

    /**
     * 初始化 JWT 工具
     */
    static async init() {
        if (this.initialized) return;

        const { createSigner, createVerifier } = await import('fast-jwt');

        this.signer = createSigner({
            key: Env.JWT_SECRET,
            expiresIn: Env.JWT_EXPIRES_IN || '7d',
            algorithm: Env.JWT_ALGORITHM || 'HS256'
        });

        this.verifier = createVerifier({
            key: Env.JWT_SECRET,
            algorithms: [Env.JWT_ALGORITHM || 'HS256']
        });

        this.initialized = true;
    }

    /**
     * 签名 JWT token
     * @param {object} payload - JWT 载荷
     * @returns {Promise<string>} JWT token
     */
    static async sign(payload) {
        await this.init();
        return this.signer(payload);
    }

    /**
     * 验证 JWT token
     * @param {string} token - JWT token
     * @returns {Promise<object>} 解码后的载荷
     */
    static async verify(token) {
        await this.init();
        return this.verifier(token);
    }

    /**
     * 创建自定义签名器
     * @param {object} options - 签名选项
     * @returns {Promise<Function>} 签名器函数
     */
    static async createSigner(options = {}) {
        const { createSigner } = await import('fast-jwt');
        return createSigner({
            key: options.key || Env.JWT_SECRET,
            expiresIn: options.expiresIn || Env.JWT_EXPIRES_IN || '7d',
            algorithm: options.algorithm || Env.JWT_ALGORITHM || 'HS256',
            ...options
        });
    }

    /**
     * 创建自定义验证器
     * @param {object} options - 验证选项
     * @returns {Promise<Function>} 验证器函数
     */
    static async createVerifier(options = {}) {
        const { createVerifier } = await import('fast-jwt');
        return createVerifier({
            key: options.key || Env.JWT_SECRET,
            algorithms: options.algorithms || [Env.JWT_ALGORITHM || 'HS256'],
            ...options
        });
    }

    /**
     * 解码 JWT token (不验证签名)
     * @param {string} token - JWT token
     * @returns {object} 解码后的内容
     */
    static decode(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }

            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));

            return { header, payload };
        } catch (error) {
            throw new Error('Failed to decode JWT: ' + error.message);
        }
    }

    /**
     * 检查 token 是否过期
     * @param {string} token - JWT token
     * @returns {boolean} 是否过期
     */
    static isExpired(token) {
        try {
            const { payload } = this.decode(token);
            if (!payload.exp) return false;
            return Date.now() >= payload.exp * 1000;
        } catch {
            return true;
        }
    }

    /**
     * 获取 token 剩余有效时间 (秒)
     * @param {string} token - JWT token
     * @returns {number} 剩余秒数，-1 表示已过期或无过期时间
     */
    static getTimeToExpiry(token) {
        try {
            const { payload } = this.decode(token);
            if (!payload.exp) return -1;
            const remaining = payload.exp - Math.floor(Date.now() / 1000);
            return remaining > 0 ? remaining : -1;
        } catch {
            return -1;
        }
    }

    /**
     * 刷新 token (重新签名相同载荷)
     * @param {string} token - 旧的 JWT token
     * @returns {Promise<string>} 新的 JWT token
     */
    static async refresh(token) {
        const { payload } = this.decode(token);
        // 移除时间相关的声明，让新 token 重新生成
        delete payload.iat;
        delete payload.exp;
        delete payload.nbf;
        return this.sign(payload);
    }
}

// 使用示例：
// const token = await JWT.sign({ userId: 123, role: 'user' });
// const payload = await JWT.verify(token);
// const isExpired = JWT.isExpired(token);
// const remaining = JWT.getTimeToExpiry(token);
// const newToken = await JWT.refresh(token);
