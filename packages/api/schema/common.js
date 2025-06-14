/**
 * 通用验证规则
 * 提供常用的验证器
 */

import { createValidator } from 'bunfly';
import { z } from 'zod';

/**
 * 通用验证器
 */
export const common = {
    // ID 验证
    id: () => createValidator().number('id', { int: true, positive: true }).build(),

    // 分页验证
    pagination: () => createValidator().number('page', { int: true, min: 1, default: 1, optional: true }).number('limit', { int: true, min: 1, max: 100, default: 10, optional: true }).build(),

    // 空验证（无参数）
    empty: () => z.object({})
};
