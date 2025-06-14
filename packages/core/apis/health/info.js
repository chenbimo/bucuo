/**
 * 健康信息 API - /core/health/info
 */

import { createApi, createRes, ERROR_CODES } from '../../libs/http.js';
import healthSchema from '../../schema/health.json';

export default createApi({
    name: '系统信息',
    method: 'get',
    schema: {
        fields: [],
        required: []
    },
    handler: async (data, context) => {
        return createRes(ERROR_CODES.SUCCESS, '系统信息获取成功', {
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
        });
    }
});
