/**
 * 创建用户 API - /user/create
 */

import { createPostAPI, createResponse, ERROR_CODES } from 'bunfly';
import { user } from '../../schema/user.js';

export default createPostAPI(user.register, async (data, context) => {
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
});
