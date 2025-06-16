/**
 * CORS 跨域插件
 */

import { Plugin } from '../libs/plugin.js';

export default Plugin({
    order: 3,
    async onRequest(context) {
        const { request, response, config } = context;

        const origin = request.headers.get('origin');
        const method = request.method;

        // 设置 CORS 头部
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.headers.set('Access-Control-Allow-Credentials', 'true');

        // 处理预检请求
        if (method === 'OPTIONS') {
            response.status = 204;
            response.body = '';
            response.sent = true;
        }
    }
});
