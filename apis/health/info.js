import { Code } from '../../config/code.js';
import { Env } from '../../config/env.js';

export default {
    name: '健康检查',
    method: 'get',
    schema: {
        fields: {},
        required: []
    },
    handler: async (bunpii, body, req) => {
        const info = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            runtime: 'Bun',
            version: Bun.version,
            platform: process.platform,
            arch: process.arch
        };
        // 检查 Redis 连接状态
        if (Env.REDIS_ENABLE === 1) {
            if (bunpii.redis) {
                try {
                    await bunpii.redis.ping();
                    info.redis = '已连接';
                } catch (error) {
                    info.redis = '未连接';
                    info.redisError = error.message;
                }
            } else {
                info.redis = '未开启';
            }
        } else {
            info.redis = '禁用';
        }
        return {
            ...Code.SUCCESS,
            data: info
        };
    }
};
