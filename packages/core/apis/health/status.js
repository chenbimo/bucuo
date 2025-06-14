/**
 * 健康状态 API - /core/health/status
 */

import { createApi } from '../../libs/http.js';
import healthSchema from '../../schema/health.json';

export default createApi({
    name: '系统状态',
    schema: healthSchema.presets.status,
    method: 'get',
    handler: async (data, context) => {- /core/health/status
 */

import { createApi } from '../../libs/http.js';
import { processSchema } from '../../libs/simple-schema.js';
import healthSchema from '../../schema/health.json';
import commonSchema from '../../schema/common.json';

const { status } = processSchema(healthSchema, commonSchema.commonRules);

export default createApi({
    name: '系统状态',
    schema: status,
    method: 'get',
    handler: async (data, context) => {
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
    }
});
