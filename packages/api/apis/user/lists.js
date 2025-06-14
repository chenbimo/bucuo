/**
 * 用户列表 API - /user/lists
 */

import { createApi, createRes } from 'bunfly';
import { loadSchema } from '../../core/libs/simple-schema.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userSchemaPath = join(__dirname, '../../schema/user.json');
const { query } = loadSchema(userSchemaPath);

export default createApi({
    name: '用户列表',
    schema: query,
    method: 'post',
    handler: async (data, context) => {
        const { page, limit } = data;
        const { cache } = context;

        // 尝试从缓存获取
        const cacheKey = `users:list:${page}:${limit}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // 模拟用户数据
        const users = Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            username: `user${i + 1}`,
            email: `user${i + 1}@example.com`,
            nickname: `用户 ${i + 1}`,
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            active: Math.random() > 0.1
        }));

        // 分页
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = users.slice(startIndex, endIndex);

        const result = createRes(
            {
                users: paginatedUsers,
                pagination: {
                    page,
                    limit,
                    total: users.length,
                    totalPages: Math.ceil(users.length / limit)
                }
            },
            '用户列表获取成功'
        );

        // 缓存结果
        await cache.set(cacheKey, result, 60); // 缓存60秒

        return result;
    }
});
