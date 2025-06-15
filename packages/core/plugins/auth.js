import { Plugin } from '../libs/plugin.js';

export default Plugin({
    name: 'auth',
    order: 6,
    async onInit(context) {},

    async onRequest(context) {
        // 解析 Authorization 头部
        const authHeader = context.request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            try {
                const payload = context.Jwt.verify(token);
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
            if (options) {
                // 如果需要自定义选项，创建临时签名器
                const customSigner = createSigner({
                    key: context.Jwt.verify.key || process.env.JWT_SECRET,
                    ...options
                });
                return customSigner(payload);
            }
            return context.Jwt.sign(payload);
        };
    }
});
