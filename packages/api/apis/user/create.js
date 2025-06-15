/**
 * 创建用户 API - /user/create
 */

import { Api, Res, Code } from 'bunfly';
import userSchema from '../../schema/user.json';

export default Api({
    name: '创建用户',
    schema: {
        fields: {
            username: userSchema.username,
            password: userSchema.password,
            email: userSchema.email,
            nickname: userSchema.nickname
        },
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
        return Res(Code.SUCCESS, '用户创建成功', newUser);
    }
});
