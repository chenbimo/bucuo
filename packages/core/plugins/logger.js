/**
 * Logger 日志插件
 */

import { Logger } from '../libs/logger.js';
import { Plugin } from '../libs/plugin.js';

export default Plugin({
    name: 'logger',
    order: 0,

    async onInit(context) {
        const { config } = context;
        const loggerConfig = config.logger;

        if (!loggerConfig.enabled) {
            console.log('Logger 插件已禁用');
            return null;
        }

        console.log('🔧 正在初始化 Logger...');
        const logger = new Logger(loggerConfig);
        console.log('✅ Logger 初始化完成');

        return { logger };
    },

    async onRequest(context, initData) {
        if (!initData || !initData.logger) {
            return;
        }

        const logger = initData.logger;
        context.logger = logger;

        // 记录请求日志
        logger.request(context);

        // 在响应后记录响应日志
        const originalAfterHooks = context.afterHooks || [];
        context.afterHooks = [...originalAfterHooks, (ctx) => logger.response(ctx)];

        // 在错误时记录错误日志
        if (context.error) {
            logger.error('请求处理错误:', context.error);
        }
    }
});
