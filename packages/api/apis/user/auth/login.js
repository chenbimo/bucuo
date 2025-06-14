/**
 * 用户登录 API - /user/auth/login
 */

import { createPostAPI, validators, createResponse, createError } from 'bunfly';

export default createPostAPI(validators.userLogin, async (data, context) => {
    const { generateToken } = context;
    const { username, password } = data;

    // 模拟验证用户
    if (username === 'admin' && password === 'admin123') {
        const user = {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            name: 'Administrator',
            role: 'admin'
        };

        const token = generateToken ? await generateToken(user) : 'mock-jwt-token';

        return createResponse(
            {
                user,
                token
            },
            'Login successful'
        );
    } else {
        throw new Error('Invalid username or password');
    }
});
