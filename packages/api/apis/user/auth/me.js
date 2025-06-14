/**
 * 获取当前用户信息 API - /user/auth/me
 */

import { createAPI, createResponse, ERROR_CODES } from 'bunfly';

export default createAPI({
    name: '当前用户信息',
    method: 'post',
    handler: async (data, context) => {
        const { user, isAuthenticated } = context;

        if (!isAuthenticated) {
            return createResponse(ERROR_CODES.UNAUTHORIZED, '需要身份验证');
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
    }
});
