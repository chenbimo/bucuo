import { Kysely, MysqlDialect, sql } from 'kysely';
import { createPool } from 'mysql2';
import { Plugin } from '../libs/plugin.js';
import { Env } from '../config/env.js';

export default Plugin({
    order: 2,
    async onInit(context) {
        try {
            // 创建 MySQL 连接池
            const config = {
                host: Env.MYSQL_HOST || '127.0.0.1',
                port: Env.MYSQL_PORT || 3306,
                database: Env.MYSQL_DB || 'test',
                user: Env.MYSQL_USER || 'root',
                password: Env.MYSQL_PASSWORD || 'root',
                connectionLimit: Env.MYSQL_POOL_MAX || 10,
                charset: 'utf8mb4_general_ci',
                // timezone: Env.TIMEZONE,
                debug: Env.MYSQL_DEBUG === 1
            };

            const pool = await createPool(config);

            // 创建 Kysely 实例
            const db = new Kysely({
                dialect: new MysqlDialect({
                    pool: pool
                })
            });

            // 测试数据库连接
            const result = await sql`SELECT VERSION() AS version`.execute(db);
            if (result?.rows?.[0]?.version) {
                context.Db = db;
            } else {
                throw new Error('无法获取数据库版本信息');
            }
        } catch (error) {
            console.error('❌ 数据库连接失败:', error.message);
            throw error;
        }
    }
});
