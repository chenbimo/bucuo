import { Env } from '../config/env.js';
import { colors } from '../utils/colors.js';

export default {
    after: ['_logger'],
    async onInit(bucuo, req) {
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
                const createClient = await import('@redis/client').then((m) => m.createClient);
                const redis = createClient(config);

                // 测试连接
                try {
                    await redis.connect();
                    // 测试连接
                    const result = await redis.ping();
                } catch (error) {
                    bucuo.logger.error(`${colors.error} Redis 连接失败:`, error);
                    process.exit();
                }

                // 添加对象存储辅助方法
                redis.setObject = async (key, obj, ttl = null) => {
                    try {
                        const data = JSON.stringify(obj);
                        if (ttl) {
                            return await redis.setEx(`${process.env.REDIS_KEY_PREFIX}:${key}`, ttl, data);
                        }
                        return await redis.set(`${process.env.REDIS_KEY_PREFIX}:${key}`, data);
                    } catch (error) {
                        bucuo.logger.error(`${colors.error} Redis setObject 错误:`, error);
                    }
                };

                redis.getObject = async (key) => {
                    try {
                        const data = await redis.get(`${process.env.REDIS_KEY_PREFIX}:${key}`);
                        return data ? JSON.parse(data) : null;
                    } catch (error) {
                        bucuo.logger.error(`${colors.error} Redis getObject 错误:`, error);
                        return null;
                    }
                };

                redis.delObject = async (key) => {
                    try {
                        await redis.del(`${process.env.REDIS_KEY_PREFIX}:${key}`);
                    } catch (error) {
                        bucuo.logger.error(`${colors.error} Redis delObject 错误:`, error);
                    }
                };

                // 添加时序ID生成函数
                redis.genTimeID = async () => {
                    const timestamp = Math.floor(Date.now() / 1000);
                    const key = `time_id_counter:${timestamp}`;

                    const counter = await redis.incr(key);
                    await redis.expire(key, 2);

                    // 前3位计数器 + 后3位随机数
                    const counterPrefix = (counter % 1000).toString().padStart(3, '0'); // 000-999
                    const randomSuffix = Math.floor(Math.random() * 1000)
                        .toString()
                        .padStart(3, '0'); // 000-999
                    const suffix = `${counterPrefix}${randomSuffix}`;

                    return Number(`${timestamp}${suffix}`);
                };

                return redis;
            } else {
                bucuo.logger.warn(`${colors.warn} Redis 未启用，跳过初始化`);
                return {};
            }
        } catch (err) {
            bucuo.logger.error(`${colors.error} Redis 初始化失败:`, err);
            process.exit();
        }
    }
};
