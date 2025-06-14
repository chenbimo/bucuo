/**
 * 创建用户 API - /user/create
 */

import { createApi, createRes, ERROR_CODES } from 'bunfly';
import userSchema from '../../schema/user.json';

export default createApi({
    name: '创建用户',
    schema: {
        fields: [userSchema.username, userSchema.password],
        required: ['username', 'password']
    },
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
        return createRes(ERROR_CODES.SUCCESS, '用户创建成功', newUser);
    }
});
