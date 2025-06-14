/**
 * 健康检查 API - /core/health/check
 */

import { createApi, createRes, ERROR_CODES } from '../../libs/http.js';
import healthSchema from '../../schema/health.json';

export default createApi({
    name: '健康检查',
    schema: {
        fields: [],
        required: []
    },
    method: 'get',
    handler: async (data, context) => {
        return createRes(ERROR_CODES.SUCCESS, '健康检查成功', {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            runtime: 'Bun',
            version: Bun.version,
            platform: process.platform,
            arch: process.arch
        });
    }
});
