import { Code } from '../../config/code.js';
import commonSchema from '../../schema/common.json';

export default {
    name: '系统信息',
    method: 'post',
    auth: true,
    schema: {
        fields: {
            title: commonSchema.title,
            keyword: commonSchema.keyword
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
