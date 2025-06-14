/**
 * 调试路由 API - /core/debug/routes
 * 使用 GET 请求查看所有已注册的路由
 */

import { createAPI } from '../../libs/http.js';

export default createAPI({
    name: '路由调试',
    method: 'get',
    handler: async (data, context) => {
        const { request } = context;

        // 获取当前 Bunfly 实例的路由信息
        // 由于我们在 API 处理器内部，需要通过 context 访问应用实例
        const app = context.app || this;

        // 如果无法直接访问应用实例，我们需要从全局或其他方式获取
        if (!app || !app.routes) {
            return {
                error: '无法访问路由信息',
                message: '应用实例不可用',
                timestamp: new Date().toISOString()
            };
        }

        // 收集所有路由信息
        const routes = [];
        for (const [key, handler] of app.routes) {
            const [method, path] = key.split(':');
            routes.push({
                method: method,
                path: path,
                handlerType: typeof handler,
                isFunction: typeof handler === 'function'
            });
        }

        // 按路径排序
        routes.sort((a, b) => a.path.localeCompare(b.path));

        // 统计信息
        const stats = {
            totalRoutes: routes.length,
            methodCounts: {},
            pathPrefixes: {}
        };

        routes.forEach((route) => {
            // 统计方法
            stats.methodCounts[route.method] = (stats.methodCounts[route.method] || 0) + 1;

            // 统计路径前缀
            const pathParts = route.path.split('/').filter((part) => part);
            if (pathParts.length > 0) {
                const prefix = '/' + pathParts[0];
                stats.pathPrefixes[prefix] = (stats.pathPrefixes[prefix] || 0) + 1;
            }
        });

        return {
            success: true,
            message: '路由调试信息',
            timestamp: new Date().toISOString(),
            stats: stats,
            routes: routes,
            debug: {
                contextKeys: Object.keys(context),
                hasApp: !!app,
                hasRoutes: !!(app && app.routes),
                routesType: app && app.routes ? typeof app.routes : 'undefined'
            }
        };
    }
});
