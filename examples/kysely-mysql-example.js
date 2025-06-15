#!/usr/bin/env bun

/**
 * Kysely MySQL 数据库插件使用示例
 * 展示如何在 Bunfly 中使用 Kysely 进行 MySQL 数据库操作
 */

import { Bunfly, createApi, createRes, ERROR_CODES } from '../packages/core/main.js';
import dbPlugin from '../packages/core/plugins/db.js';

// 创建应用实例
const app = new Bunfly({
    port: 3000,

    // MySQL 数据库配置
    database: {
        enabled: true,
        host: 'localhost',
        port: 3306,
        database: 'bunfly_example',
        user: 'root',
        password: 'password',
        pool: {
            max: 10,
            acquireTimeout: 60000,
            timeout: 60000
        },
        charset: 'utf8mb4',
        logging: true,
        testConnection: true
    }
});

// 注册数据库插件
app.plugin(dbPlugin);

// 示例 API：获取用户列表
app.api(
    '/users',
    createApi({
        name: '获取用户列表',
        method: 'get',
        handler: async (data, context) => {
            const { db } = context;

            try {
                const users = await db.selectFrom('users').select(['id', 'username', 'email', 'created_at']).where('active', '=', true).orderBy('created_at', 'desc').limit(10).execute();

                return createRes(ERROR_CODES.SUCCESS, '获取用户列表成功', users);
            } catch (error) {
                console.error('查询用户失败:', error);
                return createRes(ERROR_CODES.SERVER_ERROR, '查询用户失败');
            }
        }
    })
);

// 示例 API：创建用户
app.api(
    '/users',
    createApi({
        name: '创建用户',
        method: 'post',
        schema: {
            fields: {
                username: 'required|string|min:3|max:50',
                email: 'required|email',
                nickname: 'string|max:100'
            },
            required: ['username', 'email']
        },
        handler: async (data, context) => {
            const { db } = context;
            const { username, email, nickname } = data;

            try {
                // 检查用户名是否已存在
                const existingUser = await db.selectFrom('users').select('id').where('username', '=', username).executeTakeFirst();

                if (existingUser) {
                    return createRes(ERROR_CODES.INVALID_PARAMS, '用户名已存在');
                }

                // 创建新用户
                const newUser = await db
                    .insertInto('users')
                    .values({
                        username,
                        email,
                        nickname: nickname || username,
                        active: true,
                        created_at: new Date()
                    })
                    .returning(['id', 'username', 'email', 'nickname'])
                    .executeTakeFirstOrThrow();

                return createRes(ERROR_CODES.SUCCESS, '用户创建成功', newUser);
            } catch (error) {
                console.error('创建用户失败:', error);
                return createRes(ERROR_CODES.SERVER_ERROR, '创建用户失败');
            }
        }
    })
);

// 示例 API：更新用户
app.api(
    '/users/:id',
    createApi({
        name: '更新用户信息',
        method: 'put',
        schema: {
            fields: {
                nickname: 'string|max:100',
                email: 'email'
            },
            required: []
        },
        handler: async (data, context) => {
            const { db, params } = context;
            const userId = parseInt(params.id);
            const updateData = {};

            // 只更新提供的字段
            if (data.nickname !== undefined) updateData.nickname = data.nickname;
            if (data.email !== undefined) updateData.email = data.email;

            if (Object.keys(updateData).length === 0) {
                return createRes(ERROR_CODES.INVALID_PARAMS, '没有提供要更新的数据');
            }

            try {
                updateData.updated_at = new Date();

                const updatedUser = await db.updateTable('users').set(updateData).where('id', '=', userId).where('active', '=', true).returning(['id', 'username', 'email', 'nickname', 'updated_at']).executeTakeFirst();

                if (!updatedUser) {
                    return createRes(ERROR_CODES.API_NOT_FOUND, '用户不存在');
                }

                return createRes(ERROR_CODES.SUCCESS, '用户信息更新成功', updatedUser);
            } catch (error) {
                console.error('更新用户失败:', error);
                return createRes(ERROR_CODES.SERVER_ERROR, '更新用户失败');
            }
        }
    })
);

// 示例 API：用户统计（联表查询）
app.api(
    '/users/stats',
    createApi({
        name: '用户统计信息',
        method: 'get',
        handler: async (data, context) => {
            const { db } = context;

            try {
                // 复杂查询示例：获取用户统计信息
                const stats = await db
                    .selectFrom('users')
                    .leftJoin('user_profiles', 'users.id', 'user_profiles.user_id')
                    .select([(eb) => eb.fn.count('users.id').as('total_users'), (eb) => eb.fn.count('users.id').filterWhere('users.active', '=', true).as('active_users'), (eb) => eb.fn.count('user_profiles.id').as('users_with_profiles'), (eb) => eb.fn.avg('user_profiles.age').as('average_age')])
                    .executeTakeFirst();

                return createRes(ERROR_CODES.SUCCESS, '获取统计信息成功', stats);
            } catch (error) {
                console.error('查询统计信息失败:', error);
                return createRes(ERROR_CODES.SERVER_ERROR, '查询统计信息失败');
            }
        }
    })
);

// 示例 API：事务处理
app.api(
    '/users/transfer',
    createApi({
        name: '用户积分转账（事务示例）',
        method: 'post',
        schema: {
            fields: {
                fromUserId: 'required|number|min:1',
                toUserId: 'required|number|min:1',
                amount: 'required|number|min:1'
            },
            required: ['fromUserId', 'toUserId', 'amount']
        },
        handler: async (data, context) => {
            const { db } = context;
            const { fromUserId, toUserId, amount } = data;

            try {
                const result = await db.transaction().execute(async (trx) => {
                    // 检查转出用户余额
                    const fromUser = await trx.selectFrom('user_accounts').select(['id', 'balance']).where('user_id', '=', fromUserId).executeTakeFirst();

                    if (!fromUser || fromUser.balance < amount) {
                        throw new Error('余额不足');
                    }

                    // 检查转入用户是否存在
                    const toUser = await trx.selectFrom('user_accounts').select(['id', 'balance']).where('user_id', '=', toUserId).executeTakeFirst();

                    if (!toUser) {
                        throw new Error('转入用户不存在');
                    }

                    // 扣除转出用户余额
                    await trx
                        .updateTable('user_accounts')
                        .set({
                            balance: trx.raw('balance - ?', [amount]),
                            updated_at: new Date()
                        })
                        .where('user_id', '=', fromUserId)
                        .execute();

                    // 增加转入用户余额
                    await trx
                        .updateTable('user_accounts')
                        .set({
                            balance: trx.raw('balance + ?', [amount]),
                            updated_at: new Date()
                        })
                        .where('user_id', '=', toUserId)
                        .execute();

                    // 记录转账日志
                    const transferLog = await trx
                        .insertInto('transfer_logs')
                        .values({
                            from_user_id: fromUserId,
                            to_user_id: toUserId,
                            amount,
                            status: 'completed',
                            created_at: new Date()
                        })
                        .returning(['id', 'from_user_id', 'to_user_id', 'amount'])
                        .executeTakeFirstOrThrow();

                    return transferLog;
                });

                return createRes(ERROR_CODES.SUCCESS, '转账成功', result);
            } catch (error) {
                console.error('转账失败:', error);
                return createRes(ERROR_CODES.SERVER_ERROR, error.message || '转账失败');
            }
        }
    })
);

// 启动服务器
app.listen(() => {
    console.log('🚀 Bunfly + Kysely MySQL 示例服务器启动成功');
    console.log('📖 API 文档:');
    console.log('  GET  /users          - 获取用户列表');
    console.log('  POST /users          - 创建用户');
    console.log('  PUT  /users/:id      - 更新用户');
    console.log('  GET  /users/stats    - 用户统计');
    console.log('  POST /users/transfer - 积分转账');
});

/**
 * MySQL 数据库表结构示例：
 *
 * CREATE TABLE users (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   username VARCHAR(50) UNIQUE NOT NULL,
 *   email VARCHAR(255) UNIQUE NOT NULL,
 *   nickname VARCHAR(100),
 *   active BOOLEAN DEFAULT true,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * );
 *
 * CREATE TABLE user_profiles (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   user_id INT,
 *   age INT,
 *   bio TEXT,
 *   avatar_url VARCHAR(500),
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   FOREIGN KEY (user_id) REFERENCES users(id)
 * );
 *
 * CREATE TABLE user_accounts (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   user_id INT,
 *   balance DECIMAL(10,2) DEFAULT 0.00,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *   FOREIGN KEY (user_id) REFERENCES users(id)
 * );
 *
 * CREATE TABLE transfer_logs (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   from_user_id INT,
 *   to_user_id INT,
 *   amount DECIMAL(10,2) NOT NULL,
 *   status VARCHAR(20) DEFAULT 'pending',
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   FOREIGN KEY (from_user_id) REFERENCES users(id),
 *   FOREIGN KEY (to_user_id) REFERENCES users(id)
 * );
 */
