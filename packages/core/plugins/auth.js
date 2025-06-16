import { Plugin } from '../libs/plugin.js';
import { signer, verifier } from '../libs/jwt.js';

export default Plugin({
    name: 'auth',
    order: 6,
    async onRequest(context) {
        // 解析 Authorization 头部
        const authHeader = context.request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            try {
                const payload = verifier(token);
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
    }
});
