/**
 * 健康信息 API - /core/health/info
 */

import { Code } from '../../config/code.js';
import healthSchema from '../../schema/health.json';

export default {
    name: '系统信息',
    // method: 'get',
    schema: {
        fields: {
            title: healthSchema.title,
            keyword: healthSchema.keyword
        },
        required: ['title', 'keyword', 'name']
    },
    handler: async (bunpi, req) => {
        return {
            ...Code.SUCCESS,
            msg: '系统信息获取成功',
            data: {
                name: 'Bunpi',
                description: 'A universal JS backend API framework for Bun',
                version: '1.0.0',
                runtime: {
                    name: 'Bun',
                    version: Bun.version,
                    revision: Bun.revision || 'unknown'
                },
                features: ['Zero dependencies', 'Plugin system', 'JWT authentication', 'File upload', 'CORS support', 'Structured logging', 'Redis cache support', 'Simple routing'],
                timestamp: new Date().toISOString()
            }
        };
    }
};
