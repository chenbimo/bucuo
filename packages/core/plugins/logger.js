/**
 * Logger 日志插件
 */

import { Logger } from '../libs/logger.js';

export const loggerPlugin = {
    name: 'logger',
    order: 0,
    async handler(context) {
        const { config } = context;
        const loggerConfig = config.logger;

        if (!loggerConfig.enabled) {
            return;
        }

        if (!context.logger) {
            context.logger = new Logger(loggerConfig);
        }

        // 记录请求日志
        context.logger.request(context);

        // 在响应后记录响应日志
        const originalAfterHooks = context.afterHooks || [];
        context.afterHooks = [...originalAfterHooks, (ctx) => ctx.logger.response(ctx)];

        // 在错误时记录错误日志
        if (context.error) {
            context.logger.error_handler(context);
        }
    }
};
