/**
 * 用户更新 API - /user/update/:id
 */

import { createPostAPI, validators, createResponse, createError } from 'bunfly';

export default createPostAPI(validators.userUpdate, async (data, context) => {
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
        nickname: nickname || `User ${id}`,
        updatedAt: new Date().toISOString()
    };

    return createResponse(updatedUser, '用户更新成功');
});
    const updatedUser = {
        id: userId,
        username: body.username || `user${userId}`,
        email: body.email || `user${userId}@example.com`,
        name: body.name || `User ${userId}`,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        active: body.active !== undefined ? body.active : true,
        updatedAt: new Date().toISOString()
    };

    // 清除缓存
    await cache.del(`user:${id}`);
    await cache.del(`users:list:1:10`); // 简化缓存清理

    return {
        message: '用户更新成功',
        user: updatedUser
    };
};
