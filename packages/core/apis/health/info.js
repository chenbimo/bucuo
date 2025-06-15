/**
 * 健康信息 API - /core/health/info
 */

import { Api, Res, Code } from '../../libs/api.js';
import healthSchema from '../../schema/health.json';

export default Api({
    name: '系统信息',
    method: 'get',
    schema: {
        fields: [],
        required: []
    },
    handler: async (data, context) => {
        return Res(Code.SUCCESS, '系统信息获取成功', {
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
