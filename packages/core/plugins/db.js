import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2/promise';
import { Plugin } from '../libs/plugin.js';
import { Env } from '../libs/env.js';

export default Plugin({
    name: 'database',
    order: 0,
    async onInit(context) {
        try {
            // 创建 MySQL 连接池
            const pool = createPool({
                host: Env.MYSQL_HOST || '127.0.0.1',
                port: Env.MYSQL_PORT || 3306,
                database: Env.MYSQL_DATABASE || 'test',
                user: Env.MYSQL_USER || 'root',
                password: Env.MYSQL_PASSWORD || 'root',
                connectionLimit: Env.MYSQL_POOL_MAX || 10,
                timeout: Env.MYSQL_POOL_TIMEOUT || 60000,
                charset: 'utf8mb4',
                timezone: Env.TIMEZONE,
                debug: Env.MYSQL_DEBUG || false
            });

            // 创建 Kysely 实例
            const db = new Kysely({
                dialect: new MysqlDialect({
                    pool: pool
                }),
                onCreateConnection: (connection) => {
                    connection.on('error', (error) => {
                        console.error('❌ 数据库连接错误:', error.message);
                    });
                },
                onReserveConnection: (connection) => {
                    connection.on('error', (error) => {
                        console.error('❌ 数据库连接保留错误:', error.message);
                    });
                }
            });

            // 测试数据库连接
            await this.testConnection(db);

            // 将数据库实例添加到全局上下文，供其他插件使用
            context.Db = db;
        } catch (error) {
            console.error('❌ 数据库连接失败:', error.message);
            throw error;
        }
    },

    async testConnection(db) {
        try {
            const result = await db.selectFrom(db.raw('SELECT 1')).select('test_value').execute();

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
