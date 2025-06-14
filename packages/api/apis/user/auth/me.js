/**
 * 获取当前用户信息 API - /user/auth/me
 */

import { createPostAPI, createResponse, createError } from 'bunfly';
import { user } from '../../../schema/index.js';

export default createPostAPI(user.profile(), async (data, context) => {获取当前用户信息 API - /user/auth/me
 */

import { createPostAPI, createResponse, validators } from 'bunfly';

export default createPostAPI(validators.userProfile, async (data, context) => {
    const { user, isAuthenticated } = context;

    if (!isAuthenticated) {
        throw new Error('需要身份验证');
    }

    return createResponse(
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
});
