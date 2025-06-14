/**
 * 统计相关验证规则
 */

import { createValidator } from '../../core/libs/validation.js';
import { z } from 'zod';

/**
 * 统计验证器
 */
export const stats = {
    // 系统统计 - 无参数
    system: () => z.object({}),

    // 请求统计 - 无参数
    requests: () => z.object({}),

    // 接口路径统计 - 分页参数
    paths: () => createValidator().number('page', { int: true, min: 1, default: 1, optional: true }).number('limit', { int: true, min: 1, max: 100, default: 10, optional: true }).build(),

    // 请求方法统计 - 无参数
    methods: () => z.object({})
};
