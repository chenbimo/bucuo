import { Jwt } from '../utils/jwt.js';

export default {
    after: ['_redis', '_db'],
    async onGet(bunpii, req) {
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            try {
                const payload = await Jwt.verify(token);
                bunpii.user = payload;
            } catch (error) {
                bunpii.user = {};
            }
        } else {
            bunpii.user = {};
        }
    }
};
