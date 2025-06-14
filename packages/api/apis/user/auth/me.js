/**
 * 获取当前用户信息 API - /user/auth/me
 */

import { createApi, createRes, ERROR_CODES } from 'bunfly';
import { loadSchema } from '../../../core/libs/simple-schema.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userSchemaPath = join(__dirname, '../../../schema/user.json');
const { profile } = loadSchema(userSchemaPath);

export default createApi({
    name: '当前用户信息',
    schema: profile,
    method: 'post',
    handler: async (data, context) => {
        const { user, isAuthenticated } = context;

        if (!isAuthenticated) {
            return createRes(ERROR_CODES.UNAUTHORIZED, '需要身份验证');
        }

        return createRes(
            {
                user: user || {
                    id: 1,
                    username: 'admin',
                    email: 'admin@example.com',
                    nickname: '管理员',
                    role: 'admin'
                }
            },
            '用户信息获取成功'
        );
    }
});
