/**
 * Redis 插件
 */

import { Cache } from '../libs/cache.js';

export const redisPlugin = {
    name: 'redis',
    order: -1, // 优先加载
    async handler(context) {
        const { config } = context;
        const redisConfig = config.redis || {};

        if (!redisConfig.enabled) {
            return;
        }

        if (!context.redis) {
            const redis = new Cache(redisConfig);
            await redis.connect();
            context.redis = redis;

            // 定期清理过期缓存
            if (redis.useMemoryCache) {
                setInterval(() => redis.cleanup(), 60000); // 每分钟清理一次
            }
        }

        // 添加缓存辅助方法
        context.cache = {
            set: (key, value, ttl) => context.redis.set(key, value, ttl),
            get: (key) => context.redis.get(key),
            del: (key) => context.redis.del(key),
            exists: (key) => context.redis.exists(key),
            expire: (key, ttl) => context.redis.expire(key, ttl),
            ttl: (key) => context.redis.ttl(key),
            clear: () => context.redis.clear()
        };
    }
};
