/**
 * 健康检查相关验证规则
 */

import { z } from 'zod';

/**
 * 健康检查验证器
 */
export const health = {
    // 健康检查 - 无参数
    check: () => z.object({}),

    // 健康状态 - 无参数
    status: () => z.object({}),

    // 健康信息 - 无参数
    info: () => z.object({})
};
