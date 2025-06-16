import { serve } from 'bun';
import path from 'path';
import { Res, readDir } from './util.js';
import { Code } from './config/code.js';
import { Env } from './config/env.js';

export { Api } from './libs/api.js';
export { Code } from './config/code.js';
export { Plugin } from './libs/plugin.js';
export { Res } from './util.js';

class Bunfly {
    constructor(options = {}) {
        this.routes = new Map();
        this.pluginLists = [];
        this.pluginContext = {};
        this.beforeHooks = [];
        this.afterHooks = [];
        this.errorHandlers = [];
    }

    /**
     * 加载插件（核心插件和用户插件）
     * @param {string} pluginDir - 插件目录路径
     * @param {string} type - 插件类型 ('core' | 'user')
     */
    async loadPlugins() {
        try {
            const glob = new Bun.Glob('*.js');
            const corePlugins = [];

            // 扫描指定目录
            for await (const file of glob.scan({
                cwd: path.join(import.meta.dir, 'plugins'),
                onlyFiles: true,
                absolute: true
            })) {
                const plugin = await import(file);
                const pluginInstance = plugin.default;
                pluginInstance.pluginName = path.basename(file, '.js');
                corePlugins.push(pluginInstance);
            }

            // 按 order 排序
            corePlugins.sort((a, b) => (a.order || 0) - (b.order || 0));

            for (const plugin of corePlugins) {
                try {
                    this.pluginContext[plugin.pluginName] = await plugin?.handleInit(this.pluginContext);
                    this.pluginLists.push(plugin);
                    console.log(`✓ 插件 ${plugin.pluginName} - ${plugin.order} 初始化完成`);
                } catch (error) {
                    console.warn(`插件 ${plugin.pluginName} 初始化失败:`, error.message);
                }
            }
        } catch (error) {
            console.log('🔥[ error ]-83', error);
        }
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
     * 执行插件的请求处理钩子
     */
    async executeRequestPlugins(context) {
        for (const plugin of this.pluginLists) {
            try {
                if (plugin.handleRequest && typeof plugin.handleRequest === 'function') {
                    await plugin.handleRequest(context);
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
     * 执行插件的响应处理钩子
     */
    async executeResponsePlugins(context) {
        for (const plugin of this.pluginLists) {
            try {
                if (plugin.handleResponse && typeof plugin.handleResponse === 'function') {
                    await plugin.handleResponse(context);
                }

                // 如果响应已经发送，停止执行后续插件
                if (context.response.sent) {
                    break;
                }
            } catch (error) {
                console.error(`插件 ${plugin.name} 响应处理失败:`, error.message);
                // 响应阶段的错误不应该中断流程，只记录日志
            }
        }
    }

    /**
     * 处理请求
     */
    async handleRequest(request) {
        const context = {
            request: request,
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
            startTime: Date.now()
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

            // 执行插件的请求处理钩子
            await this.executeRequestPlugins(context);

            // 如果插件已经处理了响应，跳过路由处理
            if (!context.response.sent) {
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
                    const notFoundResponse = Res(Code.API_NOT_FOUND);
                    context.response.json(notFoundResponse);
                }
            }

            // 执行插件的响应处理钩子
            await this.executeResponsePlugins(context);

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
        await this.loadPlugins();

        const server = serve({
            port: Env.APP_PORT,
            hostname: Env.APP_HOST,
            fetch: (request, server) => this.handleRequest(request, server)
        });

        if (callback && typeof callback === 'function') {
            callback(server);
        }
    }

    /**
     * 注册路由
     */
    route(method, path, handler) {
        const key = `${method}:${path}`;
        this.routes.set(key, handler);
        return this;
    }

    /**
     * 加载 API 路由
     */
    async loadApiRoutes(baseDir = './api/apis', routePrefix = '') {
        const currentDir = path.resolve(import.meta.dir, baseDir);

        try {
            const items = await readDir(currentDir);

            for (const item of items) {
                const itemPath = path.join(currentDir, item);

                try {
                    const stats = await Bun.file(itemPath).stat();
                    if (stats.isDirectory && stats.isDirectory()) {
                        // 递归加载子目录
                        const newRoutePrefix = routePrefix ? `${routePrefix}/${item}` : item;
                        await this.loadApiRoutes(path.join(baseDir, item), newRoutePrefix);
                    } else if (item.endsWith('.js')) {
                        // 处理 JS 文件
                        const fileName = path.basename(item, '.js');

                        // 构建路由路径
                        let routePath;
                        if (routePrefix) {
                            routePath = `/${routePrefix}/${fileName}`;
                        } else {
                            routePath = `/${fileName}`;
                        }

                        const api = await import(itemPath);
                        if (api.default && typeof api.default === 'function') {
                            // 检查 API 是否被正确包裹
                            if (!api.default.__isBunflyAPI__) {
                                console.error(`\n❌ 错误：API 文件 ${item} 没有使用 Api 包裹！`);
                                process.exit(1);
                            }

                            // 注册精确路由
                            this.route('*', routePath, api.default);
                            console.log(`✓ 已加载 API 路由: ${item} -> ${routePath} [${api.default.__apiMethod__ || '未知'}]`);
                        }
                    }
                } catch (error) {
                    // 如果无法获取统计信息，尝试作为目录处理
                    if (error.code === 'EISDIR' || !item.includes('.')) {
                        const newRoutePrefix = routePrefix ? `${routePrefix}/${item}` : item;
                        await this.loadApiRoutes(path.join(baseDir, item), newRoutePrefix);
                    } else {
                        console.warn(`加载 API 失败 ${item}:`, error.message);
                    }
                }
            }
        } catch (error) {
            console.warn(`读取目录失败 ${currentDir}:`, error.message);
        }
    }
}

export { Bunfly };
