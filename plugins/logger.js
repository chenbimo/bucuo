import { Env } from '../config/env.js';
import { colors } from '../utils/colors.js';
import { logger } from '../utils/logger.js';

export default {
    after: [],
    async onInit(bucuo, req) {
        try {
            return logger;
        } catch (error) {
            console.error(`${colors.error} 数据库连接失败:`, error.message);
            process.exit();
        }
    }
};
