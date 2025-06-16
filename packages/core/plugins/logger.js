/**
 * Logger 日志插件
 */

import { Logger } from '../libs/logger.js';

export default {
    order: 0,

    async onInit(context) {
        console.log('🔧 正在初始化 Logger...');
        const logger = new Logger({
            enableFile: true,
            enableConsole: true
        });
        console.log('✅ Logger 初始化完成');
        context.Logger = logger;
    }
};
