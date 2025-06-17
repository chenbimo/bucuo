import { signer, verifier } from '../libs/jwt.js';

export default {
    order: 6,
    async onGet(context, req) {
        console.log('🔥[ req ]-6', context);
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            try {
                const payload = verifier(token);
                context.user = payload;
            } catch (error) {
                context.user = {};
            }
        } else {
            context.user = {};
        }
    }
};
