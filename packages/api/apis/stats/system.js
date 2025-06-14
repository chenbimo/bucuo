/**
 * 系统统计 API - /stats/system
 */

import { createGetAPI, validators } from 'bunfly';

export default createGetAPI(validators.empty(), async (data, context) => {
    return {
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
            pid: process.pid
        },
        timestamp: new Date().toISOString()
    };
});
