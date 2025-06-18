import { jwt } from '../utils/jwt.js';

export default {
    order: 4,
    async onGet(context, req) {
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            try {
                const payload = await jwt.verify(token);
                context.user = payload;
            } catch (error) {
                context.user = {};
            }
        } else {
            context.user = {};
        }
    }
};
