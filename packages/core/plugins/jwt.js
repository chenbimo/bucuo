/**
 * JWT 插件 - 使用 fast-jwt 第三方库
 */

import { createSigner, createVerifier } from 'fast-jwt';
import { Plugin } from '../libs/plugin.js';

export default Plugin({
    name: 'jwt',
    order: 4,
    async onInit(context) {
        console.log('🔧 正在初始化 JWT...');

        // 获取 JWT 配置
        const jwtConfig = context.config?.jwt || {};
        const secret = jwtConfig.secret || process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('JWT secret 未配置');
        }

        // 创建签名器和验证器
        const signer = createSigner({
            key: secret,
            expiresIn: jwtConfig.expiresIn || '7d',
            algorithm: jwtConfig.algorithm || 'HS256',
            ...jwtConfig.signerOptions
        });

        const verifier = createVerifier({
            key: secret,
            algorithms: [jwtConfig.algorithm || 'HS256'],
            ...jwtConfig.verifierOptions
        });

        console.log('✅ JWT 初始化完成');

        return {
            jwt: {
                sign: signer,
                verify: verifier
            }
        };
    }
});
