/**
 * Bunfly API 业务入口文件
 */

import { Bunfly } from 'bunfly';
import path from 'path';
import { fileURLToPath } from 'url';

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
        console.log('✅ BunflyAPI 初始化完成');
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
        const pluginDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'plugins');

        try {
            const files = await this.util.readDir(pluginDir);
            const pluginFiles = files.filter((file) => file.endsWith('.js'));

            for (const file of pluginFiles) {
                try {
                    const pluginPath = path.join(pluginDir, file);
                    const plugin = await import(pluginPath);
                    // 支持命名导出的插件
                    const pluginInstance = plugin.default || plugin.corsPlugin || plugin.loggerPlugin || plugin.jwtPlugin || plugin.redisPlugin || plugin.uploadPlugin || plugin.statsPlugin;

                    if (pluginInstance) {
                        this.use(pluginInstance);
                        console.log(`✓ 已加载业务插件: ${file}`);
                    }
                } catch (error) {
                    console.warn(`加载业务插件失败 ${file}:`, error.message);
                }
            }
        } catch (error) {
            console.warn('未找到业务插件目录，跳过');
        }
    }

    /**
     * 加载业务API - 使用自动路由注册
     */
    async loadBusinessAPIs() {
        // 加载业务 API (api/apis/*.js -> /xxx)
        const apiDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'apis');
        await this.loadApiRoutes(apiDir, ''); // 空前缀，直接映射到根路径

        // 加载核心 API (core/apis/*.js -> /core/xxx)
        const coreApiDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../core/apis');
        await this.loadApiRoutes(coreApiDir, 'core'); // 'core' 前缀
    }

    /**
     * 启动服务器
     */
    async start() {
        console.log('🚀 Starting Bunfly API server...');

        // 确保初始化完成
        await this.initPromise;

        console.log('环境:', process.env.NODE_ENV || 'development');
        console.log('端口:', this.port);
        console.log('主机:', this.host);

        return await this.listen((server) => {
            console.log('✅ Bunfly API server started successfully!');
            console.log('📝 健康检查:', `http://${this.host}:${this.port}/health`);
            console.log('📊 状态:', `http://${this.host}:${this.port}/status`);
            console.log('ℹ️  信息:', `http://${this.host}:${this.port}/info`);
        });
    }
}

export { BunflyAPI };
