/**
 * 数据库连接插件 - 使用 Kysely 查询构建器
 * 专为 MySQL 数据库优化
 */

import { Plugin } from '../libs/plugin.js';
import { Kysely, MysqlDialect } from 'kysely';
import mysql from 'mysql2';

export default Plugin({
    name: 'database',
    order: 0, // 数据库连接应该最早初始化

    async onInit(context) {
        const { config } = context;
        const dbConfig = config.database;

        if (!dbConfig || !dbConfig.enabled) {
            console.log('📦 数据库插件已禁用');
            return null;
        }

        try {
            // 创建 MySQL 连接池
            const pool = mysql.createPool({
                host: dbConfig.host || 'localhost',
                port: dbConfig.port || 3306,
                database: dbConfig.database,
                user: dbConfig.user || dbConfig.username,
                password: dbConfig.password,
                connectionLimit: dbConfig.pool?.max || 10,
                acquireTimeout: dbConfig.pool?.acquireTimeout || 60000,
                timeout: dbConfig.pool?.timeout || 60000,
                charset: dbConfig.charset || 'utf8mb4'
            });

            // 创建 Kysely 实例
            const db = new Kysely({
                dialect: new MysqlDialect({
                    pool: pool
                }),
                log: dbConfig.logging ? ['query', 'error'] : ['error']
            });

            console.log('🐬 MySQL 数据库连接已建立');

            // 测试数据库连接
            if (dbConfig.testConnection !== false) {
                await this.testConnection(db);
            }

            // 将数据库实例添加到全局上下文，供其他插件使用
            context.db = db;
            context.dbPool = pool;
            context.dbConfig = dbConfig;

            // 返回数据库实例供后续使用
            return {
                db,
                pool,
                config: dbConfig
            };
        } catch (error) {
            console.error('❌ 数据库连接失败:', error.message);
            throw error;
        }
    },

    async onRequest(context, initData) {
        // 将数据库实例添加到请求上下文中
        if (initData && initData.db) {
            context.db = initData.db;
            context.dbPool = initData.pool;
            context.dbConfig = initData.config;
        }
    },

    async testConnection(db) {
        try {
            const result = await db.selectFrom(db.raw('(SELECT 1 as test_value) as test_table')).select('test_value').executeTakeFirst();

            if (result && result.test_value === 1) {
                console.log('✅ MySQL 数据库连接测试成功');
            } else {
                console.warn('⚠️ MySQL 数据库连接测试无结果，但连接可能正常');
            }
        } catch (error) {
            console.error('❌ MySQL 数据库连接测试失败:', error.message);
            throw error;
        }
    }
});

/**
 * MySQL 数据库配置示例：
 *
 * {
 *   database: {
 *     enabled: true,
 *     host: 'localhost',
 *     port: 3306,
 *     database: 'myapp',
 *     user: 'root',
 *     password: 'password',
 *     pool: {
 *       max: 10,
 *       acquireTimeout: 60000,
 *       timeout: 60000
 *     },
 *     charset: 'utf8mb4',
 *     logging: false,
 *     testConnection: true
 *   }
 * }
 *
 * 使用示例：
 *
 * // 在 API 处理器中使用
 * export default Api({
 *   name: '获取用户列表',
 *   handler: async (data, context) => {
 *     const { db } = context;
 *
 *     const users = await db
 *       .selectFrom('users')
 *       .select(['id', 'username', 'email'])
 *       .where('active', '=', true)
 *       .orderBy('created_at', 'desc')
 *       .execute();
 *
 *     return Res(Code.SUCCESS, '获取成功', users);
 *   }
 * });
 *
 * // 复杂查询示例
 * const result = await db
 *   .selectFrom('users')
 *   .leftJoin('profiles', 'users.id', 'profiles.user_id')
 *   .select([
 *     'users.id',
 *     'users.username',
 *     'profiles.nickname',
 *     'profiles.avatar'
 *   ])
 *   .where('users.active', '=', true)
 *   .where('users.created_at', '>', new Date('2024-01-01'))
 *   .orderBy('users.created_at', 'desc')
 *   .limit(10)
 *   .execute();
 *
 * // 插入数据
 * const newUser = await db
 *   .insertInto('users')
 *   .values({
 *     username: 'newuser',
 *     email: 'newuser@example.com',
 *     created_at: new Date()
 *   })
 *   .returning(['id', 'username'])
 *   .executeTakeFirstOrThrow();
 *
 * // 更新数据
 * await db
 *   .updateTable('users')
 *   .set({
 *     last_login: new Date(),
 *     login_count: db.raw('login_count + 1')
 *   })
 *   .where('id', '=', userId)
 *   .execute();
 *
 * // 事务处理
 * const result = await db.transaction().execute(async (trx) => {
 *   const user = await trx
 *     .insertInto('users')
 *     .values({ username: 'test', email: 'test@example.com' })
 *     .returning('id')
 *     .executeTakeFirstOrThrow();
 *
 *   await trx
 *     .insertInto('profiles')
 *     .values({ user_id: user.id, nickname: 'Test User' })
 *     .execute();
 *
 *   return user;
 * });
 */
