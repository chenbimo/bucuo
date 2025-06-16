import { signer, verifier } from '../libs/jwt.js';

export default {
    order: 6,
    async onGet(req) {
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            try {
                const payload = verifier(token);
                req.user = payload;
            } catch (error) {
                req.user = null;
            }
        } else {
            req.user = null;
        }
    }
};
