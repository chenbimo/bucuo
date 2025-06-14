/**
 * 健康信息 API - /core/health/info
 */

import { createGetAPI } from '../../libs/http.js';
import { health } from '../../schema/index.js';

export default createGetAPI(health.info(), async (data, context) => {
    return {
        name: 'Bunfly',
        description: 'A universal JS backend API framework for Bun',
        version: '1.0.0',
        runtime: {
            name: 'Bun',
            version: Bun.version,
            revision: Bun.revision || 'unknown'
        },
        features: ['Zero dependencies', 'Plugin system', 'JWT authentication', 'File upload', 'CORS support', 'Structured logging', 'Redis cache support', 'Simple routing'],
        timestamp: new Date().toISOString()
    };
});
