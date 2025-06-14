/**
 * 健康信息 API - /core/health/info
 */

import { createAPI } from '../../libs/http.js';
import { processSchema } from '../../libs/simple-schema.js';
import healthSchema from '../../schema/health.json';
import commonSchema from '../../schema/common.json';

const { info } = processSchema(healthSchema, commonSchema.commonRules);

export default createAPI({
    name: '系统信息',
    schema: info,
    method: 'get',
    handler: async (data, context) => {
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
    }
});
