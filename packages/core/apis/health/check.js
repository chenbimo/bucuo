/**
 * 健康检查 API - /core/health/check
 */

import { createAPI } from '../../libs/http.js';
import { processSchema } from '../../libs/simple-schema.js';
import healthSchema from '../../schema/health.json';
import commonSchema from '../../schema/common.json';

const { check } = processSchema(healthSchema, commonSchema.commonRules);

export default createAPI({
    name: '健康检查',
    schema: check,
    method: 'get',
    handler: async (data, context) => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            runtime: 'Bun',
            version: Bun.version,
            platform: process.platform,
            arch: process.arch
        };
    }
});
