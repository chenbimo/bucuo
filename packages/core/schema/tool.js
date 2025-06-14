/**
 * 工具相关验证规则
 */

import { createValidator } from '../libs/validation.js';

/**
 * 工具验证器
 */
export const tool = {
    // 文件名验证
    filename: () => createValidator().string('filename', { min: 1 }).build(),

    // 文件操作
    file: () => createValidator().string('filename', { min: 1 }).string('content', { optional: true }).string('type', { optional: true }).build(),

    // 文件上传
    upload: () => createValidator().string('filename', { optional: true }).string('content', { optional: true }).build()
};
