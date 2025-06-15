import { createClient } from '@redis/client';
import { Plugin } from '../libs/plugin.js';

export default Plugin({
    name: 'redis',
    order: -1, // 优先加载

    async onInit(context) {
        console.log('🔧 正在初始化 Redis 连接...');

        // 使用 Bun 自带的 redis 连接
        const redis = createClient({
            username: process.env.REDIS_USERNAME || 'root',
            password: process.env.REDIS_PASSWORD || 'root',
            database: process.env.REDIS_DB || 0,
            socket: {
                host: process.env.REDIS_HOST || '127.0.0.1',
                port: process.env.REDIS_PORT || 6379
            }
        });

        // 测试连接
        try {
            await redis.ping();
            console.log('✅ Redis 连接初始化完成');
        } catch (error) {
            console.error('❌ Redis 连接失败:', error);
            throw error;
        }

        context.Redis = redis;
    },

    async onRequest(context, initData) {}
});
