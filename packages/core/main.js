/**
 * Bunfly Core - 基于 Bun 的通用 JS 后端 API 框架核心
 */

import { serve } from 'bun';
import path from 'path';
import { fileURLToPath } from 'url';
import { util } from './util.js';

// 导出验证工具给 API 使用
export * from './libs/validator.js';

class Bunfly {
    constructor(options = {}) {
        this.port = options.port || 3000;
        this.host = options.host || 'localhost';
        this.routes = new Map();
        this.plugins = [];
        this.middlewares = [];
        this.beforeHooks = [];
        this.afterHooks = [];
        this.errorHandlers = [];

        // 初始化默认配置
        this.config = {
            cors: {
                enabled: true,
                origin: '*',
                methods: ['GET', 'POST', 'OPTIONS'],
                headers: ['Content-Type', 'Authorization']
            },
            upload: {
                maxSize: 10 * 1024 * 1024, // 10MB
                allowedTypes: ['image/*', 'text/*', 'application/json'],
                uploadDir: './uploads'
            },
            logger: {
                enabled: true,
                level: 'info'
            }
        };

        this.loadCorePlugins();
    }

    /**
     * 加载核心插件
     */
    async loadCorePlugins() {
        const pluginDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'plugins');

        try {
            const files = await util.readDir(pluginDir);
            const pluginFiles = files.filter((file) => file.endsWith('.js'));

            const loadedPlugins = [];

            for (const file of pluginFiles) {
                try {
                    const pluginPath = path.join(pluginDir, file);
                    const plugin = await import(pluginPath);
                    // 支持命名导出的插件
                    const pluginInstance = plugin.default || plugin.corsPlugin || plugin.loggerPlugin || plugin.jwtPlugin || plugin.redisPlugin || plugin.uploadPlugin || plugin.statsPlugin;

                    if (pluginInstance) {
                        loadedPlugins.push(pluginInstance);
                        console.log(`✓ 已加载核心插件: ${file} [order: ${pluginInstance.order || 0}]`);
                    }
                } catch (error) {
                    console.warn(`加载插件失败 ${file}:`, error.message);
                }
            }

            // 按 order 排序并注册插件
            loadedPlugins.sort((a, b) => (a.order || 0) - (b.order || 0));
            loadedPlugins.forEach((plugin) => this.use(plugin));
        } catch (error) {
            console.warn('未找到插件目录，跳过插件加载');
        }
    }

    /**
     * 注册插件
     */
    use(plugin) {
        if (typeof plugin === 'function') {
            this.plugins.push(plugin);
        } else if (plugin && typeof plugin.handler === 'function') {
            this.plugins.push(plugin);
        } else {
            throw new Error('插件必须是一个函数或具有 handler 方法');
        }
        return this;
    }

    /**
     * 注册路由
     */
    route(method, path, handler) {
        const key = `${method.toUpperCase()}:${path}`;
        this.routes.set(key, handler);
        return this;
    }

    /**
     * GET 路由
     */
    get(path, handler) {
        return this.route('GET', path, handler);
    }

    /**
     * POST 路由
     */
    post(path, handler) {
        return this.route('POST', path, handler);
    }

    /**
     * 注册前置钩子
     */
    beforeRequest(hook) {
        this.beforeHooks.push(hook);
        return this;
    }

    /**
     * 注册后置钩子
     */
    afterRequest(hook) {
        this.afterHooks.push(hook);
        return this;
    }

    /**
     * 注册错误处理器
     */
    onError(handler) {
        this.errorHandlers.push(handler);
        return this;
    }

    /**
     * 匹配路由
     */
    matchRoute(method, url) {
        const pathname = new URL(url, 'http://localhost').pathname;

        // 精确匹配
        const exactKey = `${method}:${pathname}`;
        if (this.routes.has(exactKey)) {
            return { handler: this.routes.get(exactKey), params: {} };
        }

        // 参数匹配
        for (const [key, handler] of this.routes) {
            const [routeMethod, routePath] = key.split(':');

            // 支持 * 方法（匹配所有方法）
            if (routeMethod !== method && routeMethod !== '*') continue;

            const params = this.extractParams(routePath, pathname);
            if (params !== null) {
                return { handler, params };
            }
        }

        return null;
    }

    /**
     * 提取路径参数
     */
    extractParams(routePath, requestPath) {
        // 处理通配符路由 (/*)
        if (routePath.endsWith('/*')) {
            const baseRoute = routePath.slice(0, -2);
            if (requestPath.startsWith(baseRoute)) {
                return {}; // 匹配通配符路由，无参数
            }
            return null;
        }

        const routeParts = routePath.split('/');
        const requestParts = requestPath.split('/');

        if (routeParts.length !== requestParts.length) {
            return null;
        }

        const params = {};
        for (let i = 0; i < routeParts.length; i++) {
            const routePart = routeParts[i];
            const requestPart = requestParts[i];

            if (routePart.startsWith(':')) {
                const paramName = routePart.slice(1);
                params[paramName] = decodeURIComponent(requestPart);
            } else if (routePart !== requestPart) {
                return null;
            }
        }

        return params;
    }

    /**
     * 执行插件链
     */
    async executePlugins(context) {
        // 每次执行时重新排序，确保顺序正确
        const sortedPlugins = [...this.plugins].sort((a, b) => {
            const orderA = typeof a === 'function' ? 0 : a.order || 0;
            const orderB = typeof b === 'function' ? 0 : b.order || 0;
            return orderA - orderB;
        });

        for (const plugin of sortedPlugins) {
            try {
                if (typeof plugin === 'function') {
                    await plugin(context);
                } else if (plugin.handler) {
                    await plugin.handler(context);
                }

                // 如果响应已经发送，停止执行后续插件
                if (context.response.sent) {
                    break;
                }
            } catch (error) {
                context.error = error;
                throw error;
            }
        }
    }

    /**
     * 处理请求
     */
    async handleRequest(request) {
        const startTime = Date.now();
        let response = new Response();

        const context = {
            request,
            response: {
                status: 200,
                headers: new Headers(),
                body: null,
                sent: false,
                json(data) {
                    this.headers.set('Content-Type', 'application/json');
                    this.body = JSON.stringify(data);
                    return this;
                },
                text(data) {
                    this.headers.set('Content-Type', 'text/plain');
                    this.body = data;
                    return this;
                },
                html(data) {
                    this.headers.set('Content-Type', 'text/html');
                    this.body = data;
                    return this;
                },
                send() {
                    this.sent = true;
                    return new Response(this.body, {
                        status: this.status,
                        headers: this.headers
                    });
                }
            },
            params: {},
            query: {},
            body: null,
            config: this.config,
            util,
            startTime
        };

        try {
            // 解析查询参数
            const url = new URL(request.url);
            context.query = Object.fromEntries(url.searchParams);

            // 解析请求体
            if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
                const contentType = request.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    context.body = await request.json();
                } else if (contentType.includes('application/x-www-form-urlencoded')) {
                    context.body = Object.fromEntries(new URLSearchParams(await request.text()));
                } else if (contentType.includes('multipart/form-data')) {
                    context.body = await request.formData();
                } else {
                    context.body = await request.text();
                }
            }

            // 执行前置钩子
            for (const hook of this.beforeHooks) {
                await hook(context);
            }

            // 执行插件
            await this.executePlugins(context);

            // 如果插件已经处理了响应，直接返回
            if (context.response.sent) {
                return context.response.send();
            }

            // 路由匹配
            const match = this.matchRoute(request.method, request.url);
            if (match) {
                context.params = match.params;
                const result = await match.handler(context);

                // 如果处理器返回了结果且响应未发送，自动发送JSON响应
                if (result !== undefined && !context.response.sent) {
                    context.response.json(result);
                }
            } else {
                context.response.status = 404;
                context.response.json({ error: '未找到', message: `路由 ${request.method} ${new URL(request.url).pathname} 未找到` });
            }

            // 执行后置钩子
            for (const hook of this.afterHooks) {
                await hook(context);
            }

            return context.response.send();
        } catch (error) {
            context.error = error;

            // 执行错误处理器
            let handled = false;
            for (const handler of this.errorHandlers) {
                try {
                    await handler(context);
                    if (context.response.sent) {
                        handled = true;
                        break;
                    }
                } catch (handlerError) {
                    console.error('错误处理器中发生错误:', handlerError);
                }
            }

            if (!handled) {
                return new Response(
                    JSON.stringify({
                        error: '内部服务器错误',
                        message: error.message,
                        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
                    }),
                    {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            }

            return context.response.send();
        }
    }

    /**
     * 启动服务器
     */
    async listen(callback) {
        const server = serve({
            port: this.port,
            hostname: this.host,
            fetch: (request) => this.handleRequest(request)
        });

        console.log(`🚀 Bunfly 运行中 http://${this.host}:${this.port}`);

        if (callback) {
            callback(server);
        }

        return server;
    }
    /**
     * 自动加载 APIs 目录下的路由文件
     * 新规则：文件路径即路由路径，支持嵌套目录
     * core/apis/health/check.js -> /core/health/check
     * api/apis/user/detail.js -> /user/detail (不带 /api 前缀)
     */
    async loadApiRoutes(apiDir, routePrefix = '') {
        try {
            await this.loadApiRoutesRecursive(apiDir, routePrefix, '');
        } catch (error) {
            console.warn(`API 目录 ${apiDir} 未找到，跳过`);
        }
    }

    /**
     * 递归加载 API 路由
     */
    async loadApiRoutesRecursive(baseDir, routePrefix, subPath) {
        const currentDir = path.join(baseDir, subPath);

        try {
            const items = await util.readDir(currentDir);

            for (const item of items) {
                const itemPath = path.join(currentDir, item);
                const relativePath = path.join(subPath, item);

                try {
                    // 检查是否是目录
                    const stats = await Bun.file(itemPath).stat();

                    if (stats.isDirectory && stats.isDirectory()) {
                        // 递归处理子目录
                        await this.loadApiRoutesRecursive(baseDir, routePrefix, relativePath);
                    } else if (item.endsWith('.js')) {
                        // 处理 JS 文件
                        const fileName = path.basename(item, '.js');
                        const dirPath = path.dirname(relativePath).replace(/\\/g, '/');

                        // 构建路由路径
                        let routePath;
                        if (dirPath === '.') {
                            // 根目录下的文件
                            routePath = routePrefix ? `/${routePrefix}/${fileName}` : `/${fileName}`;
                        } else {
                            // 子目录下的文件
                            routePath = routePrefix ? `/${routePrefix}/${dirPath}/${fileName}` : `/${dirPath}/${fileName}`;
                        }

                        const api = await import(itemPath);
                        if (api.default && typeof api.default === 'function') {
                            // 检查 API 是否被正确包裹
                            if (!api.default.__isBunflyAPI__) {
                                console.error(`\n❌ 错误：API 文件 ${relativePath} 没有使用 createGetAPI 或 createPostAPI 包裹！`);
                                process.exit(1);
                            }

                            // 注册精确路由
                            this.route('*', routePath, api.default);
                            console.log(`✓ 已加载 API 路由: ${relativePath} -> ${routePath} [${api.default.__apiType__ || '未知'}]`);
                        }
                    }
                } catch (error) {
                    // 如果无法获取统计信息，尝试作为目录处理
                    if (error.code === 'EISDIR' || !item.includes('.')) {
                        await this.loadApiRoutesRecursive(baseDir, routePrefix, relativePath);
                    } else {
                        console.warn(`加载 API 失败 ${item}:`, error.message);
                    }
                }
            }
        } catch (error) {
            console.warn(`读取目录失败 ${currentDir}:`, error.message);
        }
    }

    /**
     * 设置配置
     */
    setConfig(key, value) {
        util.setNestedProperty(this.config, key, value);
        return this;
    }

    /**
     * 获取配置
     */
    getConfig(key) {
        return util.getNestedProperty(this.config, key);
    }
}

export { Bunfly };
