/**
 * CORS 跨域插件
 */

import { Plugin } from '../libs/plugin.js';

export default Plugin({
    name: 'cors',
    order: 1,
    async onRequest(context) {
        const { request, response, config } = context;
        const corsConfig = config.cors;

        if (!corsConfig.enabled) {
            return;
        }

        const origin = request.headers.get('origin');
        const method = request.method;

        // 设置 CORS 头部
        if (corsConfig.origin === '*') {
            response.headers.set('Access-Control-Allow-Origin', '*');
        } else if (Array.isArray(corsConfig.origin)) {
            if (corsConfig.origin.includes(origin)) {
                response.headers.set('Access-Control-Allow-Origin', origin);
            }
        } else if (typeof corsConfig.origin === 'string') {
            response.headers.set('Access-Control-Allow-Origin', corsConfig.origin);
        }

        response.headers.set('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
        response.headers.set('Access-Control-Allow-Headers', corsConfig.headers.join(', '));

        if (corsConfig.credentials) {
            response.headers.set('Access-Control-Allow-Credentials', 'true');
        }

        if (corsConfig.maxAge) {
            response.headers.set('Access-Control-Max-Age', corsConfig.maxAge.toString());
        }

        // 处理预检请求
        if (method === 'OPTIONS') {
            response.status = 204;
            response.body = '';
            response.sent = true;
        }
    }
});
