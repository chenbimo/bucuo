/**
 * Logger 日志插件
 */

import { Logger } from '../libs/logger.js';
import { Plugin } from '../libs/plugin.js';

export default Plugin({
    name: 'logger',
    order: 0,

    async onInit(context) {
        console.log('🔧 正在初始化 Logger...');
        const logger = new Logger(loggerConfig);
        console.log('✅ Logger 初始化完成');
        context.Logger = logger;
    },

    async onRequest(context, initData) {}
});
