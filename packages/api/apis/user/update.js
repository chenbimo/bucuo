/**
 * 用户更新 API - /user/update
 */

import { createApi, createRes, ERROR_CODES } from 'bunfly';
import { loadSchema } from '../../core/libs/simple-schema.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userSchemaPath = join(__dirname, '../../schema/user.json');
const { update } = loadSchema(userSchemaPath);

export default createApi({
    name: '更新用户',
    schema: update,
    method: 'post',
    handler: async (data, context) => {
        const { id, username, email, nickname } = data;

        // 模拟检查用户是否存在
        if (id > 50 && id < 1000) {
            return createRes(ERROR_CODES.FILE_NOT_FOUND, '用户未找到');
        }

        // 模拟更新用户
        const updatedUser = {
            id,
            username: username || `user${id}`,
            email: email || `user${id}@example.com`,
            nickname: nickname || `用户 ${id}`,
            updatedAt: new Date().toISOString()
        };

        return createRes(updatedUser, '用户更新成功');
    }
});
