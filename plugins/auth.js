import { Jwt } from '../utils/jwt.js';

export default {
    after: ['_redis', '_db'],
    async onGet(bucuo, req) {
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            try {
                const payload = await Jwt.verify(token);
                bucuo.user = payload;
            } catch (error) {
                bucuo.user = {};
            }
        } else {
            bucuo.user = {};
        }
    }
};
