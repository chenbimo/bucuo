import { createClient } from '@redis/client';
import { Env } from '../config/env.js';

export default {
    order: 2,
    async onInit(bunpi, req) {
        try {
            if (Env.REDIS_ENABLE === 1) {
                const config = {
                    username: Env.REDIS_USERNAME || '',
                    password: Env.REDIS_PASSWORD || '',
                    database: Env.REDIS_DB || 0,
                    socket: {
                        host: Env.REDIS_HOST || '127.0.0.1',
                        port: Env.REDIS_PORT || 6379,
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
                        // console.log('✅ Redis 客户端就绪');
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
                } catch (error) {
                    console.error('❌ Redis 连接失败:', error);
                    throw error;
                }

                return redis;
            } else {
                console.warn('Redis 未启用，跳过初始化');
                return {};
            }
        } catch (err) {
            console.error('❌ Redis 初始化失败:', err);
            return {};
        }
    }
};
