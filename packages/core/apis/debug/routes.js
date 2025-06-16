/**
 * 调试路由 API - /core/debug/routes
 * 使用 GET 请求查看所有已注册的路由
 */

import { Code } from '../../config/code.js';
import debugSchema from '../../schema/debug.json';

export default {
    name: '调试路由',
    schema: {
        fields: [],
        required: []
    },
    method: 'get',
    handler: async (bunpi, req) => {
        // 如果无法直接访问应用实例，我们需要从全局或其他方式获取
        if (!bunpi || !bunpi.routes) {
            return {
                ...Code.INTERNAL_SERVER_ERROR,
                error: '应用实例不可用',
                timestamp: new Date().toISOString()
            };
        }

        // 收集所有路由信息
        const routes = [];
        for (const [key, handler] of bunpi.routes) {
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
            ...Code.SUCCESS,
            msg: '路由调试信息',
            data: {
                timestamp: new Date().toISOString(),
                stats: stats,
                routes: routes,
                debug: {
                    contextKeys: Object.keys(context),
                    hasApp: !!app,
                    hasRoutes: !!(app && app.routes),
                    routesType: app && app.routes ? typeof app.routes : 'undefined'
                }
            }
        };
    }
};
