/**
 * 详细状态检查 API - /core/health/status
 */

import { createGetAPI, validators } from '../../libs/validation.js';

export default createGetAPI(validators.empty(), async (data, context) => {
    const { redis } = context;

    const status = {
        server: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        runtime: {
            name: 'Bun',
            version: Bun.version,
            revision: Bun.revision || 'unknown'
        },
        system: {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            pid: process.pid
        }
    };

    // 检查 Redis 连接状态
    if (redis) {
        try {
            await redis.ping();
            status.redis = 'connected';
        } catch (error) {
            status.redis = 'disconnected';
            status.redisError = error.message;
        }
    } else {
        status.redis = 'disabled';
    }

    return status;
});
