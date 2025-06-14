/**
 * 调试相关验证规则
 */

import { z } from 'zod';

/**
 * 调试验证器
 */
export const debug = {
    // 路由调试 - 无参数
    routes: () => z.object({})
};
