/**
 * 用户删除 API - /user/delete/:id
 */

import { createAPI, createResponse, ERROR_CODES } from 'bunfly';
import { loadSchema } from '../../core/libs/simple-schema.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userSchemaPath = join(__dirname, '../../schema/user.json');
const { detail } = loadSchema(userSchemaPath);

export default createAPI({
    name: '删除用户',
    schema: detail,
    method: 'post',
    handler: async (data, context) => {
        const { id } = data;
        const { cache } = context;

        // 模拟检查用户是否存在
        if (id > 50 && id < 1000) {
            return createResponse(ERROR_CODES.FILE_NOT_FOUND, '用户未找到');
        }

        // 清除缓存
        await cache.del(`user:${id}`);
        await cache.del(`users:list:1:10`); // 简化缓存清理

        const result = {
            id,
            deleted: true,
            deletedAt: new Date().toISOString()
        };

        return createResponse(result, '用户删除成功');
    }
});
