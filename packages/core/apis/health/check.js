import { Code } from '../../config/code.js';
import healthSchema from '../../schema/health.json';

export default {
    name: '健康检查',
    method: 'get',
    schema: {
        fields: {},
        required: []
    },
    handler: async (bunpi, req) => {
        return {
            ...Code.SUCCESS,
            msg: '健康检查成功',
            data: {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                runtime: 'Bun',
                version: Bun.version,
                platform: process.platform,
                arch: process.arch
            }
        };
    }
};
