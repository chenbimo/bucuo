/**
 * 健康检查 API - /core/health/check
 */

import { createGetAPI } from '../../libs/validation.js';
import { health } from '../../schema/index.js';

export default createGetAPI(health.check(), async (data, context) => {基础健康检查 API - /core/health/check
 */

import { createGetAPI, validators } from '../../libs/validation.js';

export default createGetAPI(validators.empty(), async (data, context) => {
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
});
