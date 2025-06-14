/**
 * 用户详情 API - /user/detail
 */

import { createApi, createRes, ERROR_CODES } from 'bunfly';
import { loadSchema } from '../../core/libs/simple-schema.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userSchemaPath = join(__dirname, '../../schema/user.json');
const { detail } = loadSchema(userSchemaPath);

export default createApi({
    name: '用户详情',
    schema: detail,
    method: 'post',
    handler: async (data, context) => {
        const { id } = data;
        const { cache } = context;

        // 尝试从缓存获取
        const cacheKey = `user:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // 模拟用户数据
        if (id > 50 && id < 1000) {
            return createRes(ERROR_CODES.FILE_NOT_FOUND, '用户未找到');
        }

        const user = {
            id,
            username: `user${id}`,
            email: `user${id}@example.com`,
            nickname: `用户 ${id}`,
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            active: Math.random() > 0.1,
            profile: {
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
                bio: `这是用户 ${id} 的个人简介`,
                location: '地球'
            }
        };

        const result = createRes(user, '用户详情获取成功');

        // 缓存结果
        await cache.set(cacheKey, result, 300); // 缓存5分钟

        return result;
    }
});
