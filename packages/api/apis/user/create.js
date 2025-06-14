/**
 * 创建用户 API - /user/create
 */

import { createPostAPI, createResponse, createError } from 'bunfly';
import { user } from '../../schema/index.js';

export default createPostAPI(user.create(), async (data, context) => {用户创建 API - /user/create
 */

import { createPostAPI, validators, createResponse } from 'bunfly';

export default createPostAPI(validators.userCreate, async (data, context) => {
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
    return createResponse(newUser, '用户创建成功');
});
