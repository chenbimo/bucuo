/**
 * 新的插件化 API 封装模式示例
 * 展示如何使用新的 createAPI 函数来定义接口
 */

import { createAPI, createResponse } from 'bunfly';
import { user, common } from '../schema/index.js';

// 示例 1: POST 接口（用户登录）
export const userLoginAPI = createAPI({
    name: '用户登录',
    schema: user.login,
    method: 'post',
    handler: async (data, context) => {
        const { username, password } = data;

        // 模拟登录逻辑
        if (username === 'admin' && password === 'password') {
            return createResponse(200, '登录成功', {
                user: { id: 1, username: 'admin', role: 'admin' },
                token: 'fake-jwt-token'
            });
        }

        return createResponse(401, '用户名或密码错误');
    }
});

// 示例 2: GET 接口（用户详情）
export const userDetailAPI = createAPI({
    name: '用户详情',
    schema: user.detail,
    method: 'get',
    handler: async (data, context) => {
        const { id } = data;

        // 模拟获取用户详情
        const userData = {
            id,
            username: `user${id}`,
            email: `user${id}@example.com`,
            nickname: `用户 ${id}`,
            createdAt: new Date().toISOString()
        };

        return createResponse(200, '获取成功', userData);
    }
});

// 示例 3: GET 接口（无参数）
export const healthCheckAPI = createAPI({
    name: '健康检查',
    // schema: null, // 无需验证参数
    method: 'get',
    handler: async (data, context) => {
        return createResponse(200, '服务正常', {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    }
});

// 示例 4: POST 接口（用户创建）
export const userCreateAPI = createAPI({
    name: '创建用户',
    schema: user.register,
    method: 'post',
    handler: async (data, context) => {
        const { username, email, password } = data;

        // 模拟创建用户逻辑
        const newUser = {
            id: Math.floor(Math.random() * 1000) + 1,
            username,
            email,
            createdAt: new Date().toISOString()
        };

        return createResponse(201, '用户创建成功', newUser);
    }
});

// 示例 5: GET 接口（列表分页）
export const userListAPI = createAPI({
    name: '用户列表',
    schema: user.query,
    method: 'get',
    handler: async (data, context) => {
        const { page = 1, limit = 10, keyword } = data;

        // 模拟分页查询
        const users = Array.from({ length: limit }, (_, i) => ({
            id: (page - 1) * limit + i + 1,
            username: `user${(page - 1) * limit + i + 1}`,
            email: `user${(page - 1) * limit + i + 1}@example.com`
        }));

        return createResponse(200, '获取成功', {
            users,
            pagination: {
                page,
                limit,
                total: 100,
                totalPages: Math.ceil(100 / limit)
            }
        });
    }
});

/**
 * 导出所有 API（使用默认导出的插件模式）
 * 每个接口都是独立的插件，可以单独导入和使用
 */
export default {
    userLogin: userLoginAPI,
    userDetail: userDetailAPI,
    healthCheck: healthCheckAPI,
    userCreate: userCreateAPI,
    userList: userListAPI
};
