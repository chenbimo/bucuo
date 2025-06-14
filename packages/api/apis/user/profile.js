/**
 * 用户资料 API - /user/profile
 */

import { createApi, createRes, ERROR_CODES } from 'bunfly';
import { loadSchema } from '../../core/libs/simple-schema.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userSchemaPath = join(__dirname, '../../schema/user.json');
const { profile } = loadSchema(userSchemaPath);

export default createApi({
    name: '用户资料',
    schema: profile,
    method: 'get',
    handler: async (data, context) => {
        const { user, requireAuth } = context;

        // 这里可以根据需要进行认证检查
        if (requireAuth && !requireAuth()) {
            return createRes(ERROR_CODES.UNAUTHORIZED, '需要身份验证');
        }

        // 模拟当前用户资料
        const profile = {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            nickname: '管理员',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            bio: '系统管理员',
            location: '服务器机房',
            joinedAt: '2024-01-01T00:00:00.000Z',
            lastLoginAt: new Date().toISOString(),
            settings: {
                theme: 'light',
                language: 'zh-CN',
                notifications: true
            }
        };

        return createRes(
            {
                user: user || profile,
                timestamp: new Date().toISOString()
            },
            '用户资料获取成功'
        );
    }
});
