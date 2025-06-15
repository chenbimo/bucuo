import { createClient } from '@redis/client';
import { Plugin } from '../libs/plugin.js';

export default Plugin({
    name: 'redis',
    order: 1,
    async onInit(context) {
        console.log('🔧 正在初始化 Redis 连接...');
        const config = {
            username: process.env.REDIS_USERNAME || '',
            password: process.env.REDIS_PASSWORD || '',
            database: process.env.REDIS_DB || 0,
            socket: {
                host: process.env.REDIS_HOST || '127.0.0.1',
                port: process.env.REDIS_PORT || 6379,
                reconnectStrategy: (retries) => {
                    // 指数退避重连策略，最大延迟 2 秒
                    const jitter = Math.floor(Math.random() * 200);
                    const delay = Math.min(Math.pow(2, retries) * 50, 2000);
                    return delay + jitter;
                }
            }
        };

        // 使用 Bun 自带的 redis 连接
        const redis = createClient(config)
            .on('error', (err) => {
                console.error('❌ Redis 客户端错误');
            })
            .on('ready', () => {
                console.log('✅ Redis 客户端就绪');
            })
            .on('end', () => {
                console.log('🔚 Redis 连接已结束');
            })
            .on('reconnecting', () => {
                console.log('🔄 Redis 正在重连...');
            });

        // 测试连接
        try {
            await redis.connect();
            // 测试连接
            const result = await redis.ping();
            console.log('✅ Redis 连接初始化完成, PING 响应:', result);
        } catch (error) {
            console.error('❌ Redis 连接失败:', error);
            throw error;
        }

        context.Redis = redis;
    }
});
