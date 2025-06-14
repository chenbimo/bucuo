/**
 * 健康检查 API - /core/health/check
 */

import { createAPI } from '../../libs/http.js';

export default createAPI({
    name: '健康检查',
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
