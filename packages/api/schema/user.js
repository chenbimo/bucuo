/**
 * 用户相关验证规则
 */

import { createValidator } from 'bunfly';

/**
 * 用户验证器
 */
export const user = {
    // 用户登录
    login: () => createValidator().string('username', { min: 1 }).string('password', { min: 6 }).build(),

    // 用户创建
    create: () => createValidator().string('username', { min: 1 }).string('password', { min: 6 }).string('email', { email: true, optional: true }).string('nickname', { optional: true }).build(),

    // 用户更新
    update: () => createValidator().number('id', { int: true, positive: true }).string('username', { min: 1, optional: true }).string('email', { email: true, optional: true }).string('nickname', { optional: true }).build(),

    // 用户资料
    profile: () => createValidator().string('token', { optional: true }).build()
};
