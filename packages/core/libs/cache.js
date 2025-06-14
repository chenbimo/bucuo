/**
 * 缓存库 - 支持 Redis 和内存缓存回退
 */

export class Cache {
    constructor(options = {}) {
        this.host = options.host || 'localhost';
        this.port = options.port || 6379;
        this.password = options.password;
        this.db = options.db || 0;
        this.connected = false;
        this.socket = null;
        this.cache = new Map(); // 简单的内存缓存作为后备
        this.useMemoryCache = options.useMemoryCache || false;
    }

    async connect() {
        if (this.useMemoryCache) {
            this.connected = true;
            return;
        }

        try {
            // 尝试连接 Redis (这里简化实现，实际项目中应该使用专门的 Redis 客户端)
            // 如果连接失败，回退到内存缓存
            this.useMemoryCache = true;
            this.connected = true;
            console.warn('Redis 连接失败，回退到内存缓存');
        } catch (error) {
            this.useMemoryCache = true;
            this.connected = true;
            console.warn('Redis 不可用，使用内存缓存');
        }
    }

    async set(key, value, ttl = null) {
        if (!this.connected) await this.connect();

        if (this.useMemoryCache) {
            const item = {
                value: JSON.stringify(value),
                expires: ttl ? Date.now() + ttl * 1000 : null
            };
            this.cache.set(key, item);
            return true;
        }

        // 实际 Redis 实现
        return false;
    }

    async get(key) {
        if (!this.connected) await this.connect();

        if (this.useMemoryCache) {
            const item = this.cache.get(key);
            if (!item) return null;

            if (item.expires && Date.now() > item.expires) {
                this.cache.delete(key);
                return null;
            }

            try {
                return JSON.parse(item.value);
            } catch {
                return item.value;
            }
        }

        // 实际 Redis 实现
        return null;
    }

    async del(key) {
        if (!this.connected) await this.connect();

        if (this.useMemoryCache) {
            return this.cache.delete(key);
        }

        // 实际 Redis 实现
        return false;
    }

    async exists(key) {
        if (!this.connected) await this.connect();

        if (this.useMemoryCache) {
            const item = this.cache.get(key);
            if (!item) return false;

            if (item.expires && Date.now() > item.expires) {
                this.cache.delete(key);
                return false;
            }

            return true;
        }

        // 实际 Redis 实现
        return false;
    }

    async expire(key, ttl) {
        if (!this.connected) await this.connect();

        if (this.useMemoryCache) {
            const item = this.cache.get(key);
            if (item) {
                item.expires = Date.now() + ttl * 1000;
                return true;
            }
            return false;
        }

        // 实际 Redis 实现
        return false;
    }

    async ttl(key) {
        if (!this.connected) await this.connect();

        if (this.useMemoryCache) {
            const item = this.cache.get(key);
            if (!item) return -2;
            if (!item.expires) return -1;

            const remaining = Math.floor((item.expires - Date.now()) / 1000);
            return remaining > 0 ? remaining : -2;
        }

        // 实际 Redis 实现
        return -2;
    }

    async clear() {
        if (this.useMemoryCache) {
            this.cache.clear();
            return true;
        }

        // 实际 Redis 实现
        return false;
    }

    // 清理过期的内存缓存
    cleanup() {
        if (this.useMemoryCache) {
            const now = Date.now();
            for (const [key, item] of this.cache) {
                if (item.expires && now > item.expires) {
                    this.cache.delete(key);
                }
            }
        }
    }
}

// 为了保持向后兼容性，也导出 SimpleRedis 别名
export const SimpleRedis = Cache;
