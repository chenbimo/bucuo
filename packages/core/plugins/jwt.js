/**
 * JWT 插件 - 使用 Bun 的加密 API
 */

import { JWT } from '../libs/jwt.js';
import { Plugin } from '../libs/plugin.js';

export default Plugin({
    name: 'jwt',
    order: 4,
    async onInit(context) {
        const { config } = context;
        const jwtConfig = config.jwt || {};

        if (!jwtConfig.enabled) {
            console.log('JWT 插件已禁用');
            return null;
        }

        console.log('🔧 正在初始化 JWT...');
        const jwt = new JWT(jwtConfig.secret, jwtConfig);
        console.log('✅ JWT 初始化完成');

        return { jwt };
    },

    async onRequest(context, initData) {
        if (!initData || !initData.jwt) {
            return;
        }

        const { request } = context;
        const jwt = initData.jwt;
        context.jwt = jwt;

        // 解析 Authorization 头部
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            try {
                const payload = jwt.verify(token);
                context.user = payload;
                context.isAuthenticated = true;
            } catch (error) {
                context.user = null;
                context.isAuthenticated = false;
                context.authError = error.message;
            }
        } else {
            context.user = null;
            context.isAuthenticated = false;
        }

        // 添加辅助方法到上下文
        context.requireAuth = () => {
            if (!context.isAuthenticated) {
                context.response.status = 401;
                context.response.json({
                    error: '未授权',
                    message: context.authError || '需要身份验证'
                });
                context.response.sent = true;
                return false;
            }
            return true;
        };

        context.generateToken = (payload, options) => {
            return jwt.sign(payload, options);
        };
    }
});
