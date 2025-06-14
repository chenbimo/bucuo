/**
 * 核心通用验证规则
 * 提供基础的验证器
 */

import { createValidator } from '../libs/validation.js';
import { z } from 'zod';

/**
 * 通用验证器（使用 ValidationBuilder）
 */
export const common = {
    // 空验证（无参数）
    empty: () => z.object({}),

    // 分页验证（核心功能）
    pagination: () => createValidator().number('page', { int: true, min: 1, default: 1, optional: true }).number('limit', { int: true, min: 1, max: 100, default: 10, optional: true }).build()
};

/**
 * 常用的 Zod 验证模式 - 核心工具相关
 */
export const commonSchemas = {
    // ID 参数
    id: z.object({
        id: z.number().int().positive('ID 必须是正整数')
    }),

    // 分页参数
    pagination: z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(10)
    }),

    // 文件上传
    fileUpload: z.object({
        filename: z.string().min(1, '文件名是必须的'),
        content: z.string().optional(),
        type: z.string().optional()
    }),

    // 文件操作
    fileOperation: z.object({
        filename: z.string().min(1, '文件名是必须的')
    })
};
