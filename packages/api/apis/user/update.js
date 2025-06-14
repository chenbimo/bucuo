/**
 * 用户更新 API - /user/update
 */

import { createPostAPI, createResponse, createError } from 'bunfly';
import { user } from '../../schema/index.js';

export default createPostAPI(user.update(), async (data, context) => {
    const { id, username, email, nickname } = data;

    // 模拟检查用户是否存在
    if (id > 50 && id < 1000) {
        throw new Error('用户未找到');
    }

    // 模拟更新用户
    const updatedUser = {
        id,
        username: username || `user${id}`,
        email: email || `user${id}@example.com`,
        nickname: nickname || `用户 ${id}`,
        updatedAt: new Date().toISOString()
    };

    return createResponse(updatedUser, '用户更新成功');
});
