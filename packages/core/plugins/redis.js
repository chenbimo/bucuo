/**
 * Redis 插件
 */

import { Cache } from '../libs/cache.js';
import { createPlugin } from '../libs/plugin.js';

export default createPlugin({
    name: 'redis',
    order: -1, // 优先加载

    async onInit(context) {
        const { config } = context;
        const redisConfig = config.redis || {};

        if (!redisConfig.enabled) {
            console.log('Redis 插件已禁用');
            return null;
        }

        console.log('🔧 正在初始化 Redis 连接...');
        const cache = new Cache(redisConfig);
        await cache.connect();
        console.log('✅ Redis 连接初始化完成');

        // 定期清理过期缓存
        if (cache.useMemoryCache) {
            setInterval(() => cache.cleanup(), 60000); // 每分钟清理一次
        }

        return { cache };
    },

    async onRequest(context, initData) {
        if (!initData || !initData.cache) {
            return;
        }

        const cache = initData.cache;
        context.redis = cache;

        // 添加缓存辅助方法
        context.cache = {
            set: (key, value, ttl) => cache.set(key, value, ttl),
            get: (key) => cache.get(key),
            del: (key) => cache.del(key),
            exists: (key) => cache.exists(key),
            expire: (key, ttl) => cache.expire(key, ttl),
            ttl: (key) => cache.ttl(key),
            clear: () => cache.clear()
        };
    }
});
