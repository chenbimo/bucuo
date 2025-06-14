/**
 * 业务层健康检查 API - /health
 * 提供简单的服务状态检查，不带前缀
 */

import { createGetAPI, validators } from 'bunfly';

export default createGetAPI(validators.empty(), async (data, context) => {
    return {
        status: 'ok',
        message: '服务运行正常',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        runtime: 'Bun',
        version: Bun.version,
        service: 'Bunfly API'
    };
});
