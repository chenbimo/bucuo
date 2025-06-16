/**
 * Logger 日志插件
 */

import { Logger } from '../libs/logger.js';

export default {
    order: 1,

    async onInit(context) {
        const logger = new Logger({
            enableFile: true,
            enableConsole: true
        });
        context.Logger = logger;
    }
};
