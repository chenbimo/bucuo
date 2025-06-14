/**
 * 用户登录 API - /user/auth/login
 */

import { createAPI, createResponse, ERROR_CODES } from 'bunfly';
import { processSchema } from '../../../core/libs/simple-schema.js';
import userSchema from '../../../schema/user.json';
import commonSchema from '../../../core/schema/common.json';

const { login } = processSchema(userSchema, commonSchema.commonRules);

export default createAPI({
    name: '用户登录',
    schema: login,
    method: 'post',
    handler: async (data, context) => {
        const { generateToken } = context;
        const { username, password } = data;

        // 模拟验证用户
        if (username === 'admin' && password === 'admin123') {
            const userInfo = {
                id: 1,
                username: 'admin',
                email: 'admin@example.com',
                nickname: '管理员',
                role: 'admin'
            };

            const token = generateToken ? await generateToken(userInfo) : 'mock-jwt-token';

            return createResponse(ERROR_CODES.SUCCESS, '登录成功', {
                user: userInfo,
                token
            });
        } else {
            return createResponse(ERROR_CODES.UNAUTHORIZED, '用户名或密码错误');
        }
    }
});
