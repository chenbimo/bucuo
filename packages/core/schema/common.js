/**
 * 核心通用验证规则
 * 提供基础的验证器
 */

import { createValidator } from '../libs/validation.js';
import { z } from 'zod';

/**
 * 通用验证器
 */
export const common = {
    // 空验证（无参数）
    empty: () => z.object({}),

    // 分页验证（核心功能）
    pagination: () => createValidator().number('page', { int: true, min: 1, default: 1, optional: true }).number('limit', { int: true, min: 1, max: 100, default: 10, optional: true }).build()
};
