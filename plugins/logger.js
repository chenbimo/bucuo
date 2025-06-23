import { Env } from '../config/env.js';
import { colors } from '../utils/colors.js';
import { Logger } from '../utils/logger.js';

export default {
    after: [],
    async onInit(bunpii) {
        try {
            return Logger;
        } catch (error) {
            console.error(`${colors.error} 数据库连接失败:`, error.message);
            process.exit();
        }
    }
};
