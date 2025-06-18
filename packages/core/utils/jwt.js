import { Env } from '../config/env.js';

class JwtManager {
    constructor() {
        this.signer = null;
        this.verifier = null;
        this.initialized = false;
    }

    // 初始化JWT工具
    async init() {
        if (this.initialized) {
            return;
        }

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

    // 确保已初始化
    async ensureInitialized() {
        if (!this.initialized) {
            await this.init();
        }
    }

    // 签名token
    async sign(payload) {
        await this.ensureInitialized();
        return this.signer(payload);
    }

    // 验证token
    async verify(token) {
        await this.ensureInitialized();
        return this.verifier(token);
    }

    // 获取签名器（用于高级用法）
    async getSigner() {
        await this.ensureInitialized();
        return this.signer;
    }

    // 获取验证器（用于高级用法）
    async getVerifier() {
        await this.ensureInitialized();
        return this.verifier;
    }
}

// 导出单例实例
export const jwt = new JwtManager();
// 确保在应用启动时初始化
