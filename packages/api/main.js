/**
 * Bunfly API 业务入口文件
 */

import { Bunfly } from 'bunfly';
import { util } from '../core/util.js';
import path from 'path';

class BunflyAPI extends Bunfly {
    constructor(options = {}) {
        super(options);

        // 加载环境配置
        this.loadEnvConfig();

        // 标记初始化状态
        this.initialized = false;
        this.initPromise = this.initialize();
    }

    /**
     * 异步初始化方法
     */
    async initialize() {
        if (this.initialized) return;

        // 加载业务插件和API
        await this.loadBusinessPlugins();
        await this.loadBusinessAPIs();

        this.initialized = true;
    }

    /**
     * 加载环境配置
     */
    loadEnvConfig() {
        const env = process.env.NODE_ENV || 'development';
        const envFile = `.env.${env}`;

        try {
            // 这里简化实现，实际项目中可以使用 dotenv 或类似库
            console.log(`加载环境: ${env}`);

            // 设置默认配置
            if (env === 'production') {
                this.setConfig('logger.level', 'info');
                this.setConfig('cors.origin', process.env.CORS_ORIGIN || 'localhost');
            } else {
                this.setConfig('logger.level', 'debug');
                this.setConfig('cors.origin', '*');
            }

            // JWT 配置
            this.setConfig('jwt.enabled', true);
            this.setConfig('jwt.secret', process.env.JWT_SECRET || 'bunfly-api-secret');
            this.setConfig('jwt.expiresIn', process.env.JWT_EXPIRES_IN || '7d');

            // Redis 配置
            this.setConfig('redis.enabled', true);
            this.setConfig('redis.host', process.env.REDIS_HOST || 'localhost');
            this.setConfig('redis.port', parseInt(process.env.REDIS_PORT) || 6379);
            this.setConfig('redis.useMemoryCache', process.env.REDIS_USE_MEMORY_CACHE === 'true');

            // 上传配置
            this.setConfig('upload.enabled', true);
            this.setConfig('upload.uploadDir', process.env.UPLOAD_DIR || './uploads');
            this.setConfig('upload.maxSize', parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024);
        } catch (error) {
            console.warn(`加载环境配置失败: ${error.message}`);
        }
    }

    /**
     * 加载业务插件
     */
    async loadBusinessPlugins() {
        const pluginDir = path.join(import.meta.dir, 'plugins');

        try {
            const files = await util.readDir(pluginDir);
            const pluginFiles = files.filter((file) => file.endsWith('.js'));

            const loadedPlugins = [];

            for (const file of pluginFiles) {
                try {
                    const pluginPath = path.join(pluginDir, file);
                    const plugin = await import(pluginPath);

                    // 统一使用 default 导出
                    const pluginInstance = plugin.default;

                    if (pluginInstance && typeof pluginInstance.handler === 'function') {
                        loadedPlugins.push(pluginInstance);
                        console.log(`✓ 已加载业务插件: ${file} [${pluginInstance.name}] [order: ${pluginInstance.order || 0}]`);
                    } else {
                        console.warn(`插件 ${file} 没有正确的 default 导出或缺少 handler 方法`);
                    }
                } catch (error) {
                    console.warn(`加载业务插件失败 ${file}:`, error.message);
                }
            }

            // 按 order 排序并注册插件
            loadedPlugins.sort((a, b) => (a.order || 0) - (b.order || 0));
            loadedPlugins.forEach((plugin) => this.use(plugin));

            // 初始化业务插件
            await this.initializeBusinessPlugins(loadedPlugins);
        } catch (error) {
            console.warn('未找到业务插件目录，跳过');
        }
    }

    /**
     * 初始化业务插件
     */
    async initializeBusinessPlugins(plugins) {
        console.log('🔌 正在初始化业务插件...');

        // 等待核心插件初始化完成
        await super.initPromise;

        // 创建一个临时的上下文来初始化插件，包含核心组件
        const tempContext = {
            config: this.config,
            util,
            request: null,
            response: null,
            redis: this.coreComponents?.redis,
            cache: this.coreComponents?.redis
                ? {
                      set: (key, value, ttl) => this.coreComponents.redis.set(key, value, ttl),
                      get: (key) => this.coreComponents.redis.get(key),
                      del: (key) => this.coreComponents.redis.del(key),
                      exists: (key) => this.coreComponents.redis.exists(key),
                      expire: (key, ttl) => this.coreComponents.redis.expire(key, ttl),
                      ttl: (key) => this.coreComponents.redis.ttl(key),
                      clear: () => this.coreComponents.redis.clear()
                  }
                : null,
            logger: this.coreComponents?.logger
        };

        for (const plugin of plugins) {
            try {
                if (plugin.handler && typeof plugin.handler === 'function') {
                    await plugin.handler(tempContext);
                    console.log(`✓ 业务插件 ${plugin.name} 初始化完成`);
                }
            } catch (error) {
                console.warn(`业务插件 ${plugin.name} 初始化失败:`, error.message);
            }
        }
    }

    /**
     * 加载业务API - 使用自动路由注册
     */
    async loadBusinessAPIs() {
        // 加载业务 API (api/apis/*.js -> /xxx)
        const apiDir = path.join(import.meta.dir, 'apis');
        await this.loadApiRoutes(apiDir, ''); // 空前缀，直接映射到根路径

        // 加载核心 API (core/apis/*.js -> /core/xxx)
        const coreApiDir = path.join(import.meta.dir, '../core/apis');
        await this.loadApiRoutes(coreApiDir, 'core'); // 'core' 前缀
    }

    /**
     * 启动服务器
     */
    async start() {
        console.log('🚀 Starting Bunfly API server...');

        // 确保初始化完成
        await this.initPromise;

        return await this.listen((server) => {
            console.log('📝 健康检查:', `http://${this.host}:${this.port}/core/health/check`);
            console.log('📊 状态:', `http://${this.host}:${this.port}/core/health/status`);
            console.log('ℹ️  信息:', `http://${this.host}:${this.port}/core/health/info`);
        });
    }
}

export { BunflyAPI };
