/**
 * 创建用户 API - /user/create
 */

import { createAPI, createResponse, ERROR_CODES } from 'bunfly';
import { loadSchema } from '../../core/libs/simple-schema.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userSchemaPath = join(__dirname, '../../schema/user.json');
const { register } = loadSchema(userSchemaPath);

export default createAPI({
    name: '创建用户',
    schema: register,
    method: 'post',
    handler: async (data, context) => {
        const { username, password, email, nickname } = data;

        // 模拟创建用户
        const newUser = {
            id: Math.floor(Math.random() * 10000) + 1000,
            username,
            email,
            nickname: nickname || username,
            createdAt: new Date().toISOString(),
            active: true
        };

        context.response.status = 201;
        return createResponse(ERROR_CODES.SUCCESS, '用户创建成功', newUser);
    }
});
