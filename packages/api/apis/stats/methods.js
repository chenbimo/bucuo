/**
 * 方法统计 API - /stats/methods
 */

import { createGetAPI, validators } from 'bunfly';

export default createGetAPI(validators.empty(), async (data, context) => {
    const { cache } = context;

    if (!cache) {
        return { error: 'Cache not available' };
    }

    try {
        const methods = ['GET', 'POST', 'PUT', 'DELETE'];
        const stats = {};

        for (const method of methods) {
            stats[method] = (await cache.get(`stats:methods:${method}`)) || 0;
        }

        return {
            methods: stats,
            total: Object.values(stats).reduce((sum, count) => sum + count, 0)
        };
    } catch (error) {
        return { error: '获取方法统计信息失败' };
    }
});
