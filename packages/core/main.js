import { serve } from 'bun';
import path from 'path';
import { Code } from './config/code.js';
import { Env } from './config/env.js';

export { Code } from './config/code.js';

class Bunfly {
    constructor(options = {}) {
        this.apiRoutes = new Map();
        this.pluginLists = [];
        this.pluginContext = {};
        this.errorHandlers = [];
    }

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
                    this.pluginContext[plugin.pluginName] = typeof plugin?.onInit === 'function' ? await plugin?.onInit(this.pluginContext) : {};
                    this.pluginLists.push(plugin);
                    console.log(`✅ 插件 ${plugin.pluginName} - ${plugin.order} 初始化完成`);
                } catch (error) {
                    console.warn(`插件 ${plugin.pluginName} 初始化失败:`, error.message);
                }
            }
        } catch (error) {
            console.log('🔥[ error ]-83', error);
        }
    }

    async loadApis() {
        try {
            const glob = new Bun.Glob('**/*.js');
            const coreApisDir = path.join(import.meta.dir, 'apis');
            const coreApis = [];

            // 扫描指定目录
            for await (const file of glob.scan({
                cwd: coreApisDir,
                onlyFiles: true,
                absolute: true
            })) {
                const api = await import(file);
                const apiInstance = api.default;
                apiInstance.route = path.relative(coreApisDir, file).replace(/\.js$/, '').replace(/\\/g, '/');
                coreApis.push(apiInstance);
            }
        } catch (error) {
            console.error('加载 API 时发生错误:', error);
        }
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
        if (this.apiRoutes.has(exactKey)) {
            return { handler: this.apiRoutes.get(exactKey), params: {} };
        }

        // 参数匹配
        for (const [key, handler] of this.apiRoutes) {
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

            // 执行插件的请求处理钩子
            for await (const plugin of this.pluginLists) {
                try {
                    await plugin?.onGet(context);

                    // 如果响应已经发送，停止执行后续插件
                    if (context.response.sent) {
                        break;
                    }
                } catch (error) {
                    context.error = error;
                    throw error;
                }
            }

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
                    context.response.json({ ...Code.API_NOT_FOUND });
                }
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
        await this.loadApis();

        const server = serve({
            port: Env.APP_PORT,
            hostname: Env.APP_HOST,
            fetch: (request, server) => this.handleRequest(request, server)
        });

        if (callback && typeof callback === 'function') {
            callback(server);
        }
    }
}

export { Bunfly };
