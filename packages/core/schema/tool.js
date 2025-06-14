/**
 * 工具相关验证规则
 */

import { extendRules } from './common.js';

/**
 * 工具字段池
 */
export const toolRules = {
    filename: 'string|min:1|max:255',
    content: 'string|optional',
    type: 'string|optional|max:50',
    path: 'string|min:1|max:500'
};

/**
 * 工具规则对象
 */
export const tool = {
    // 文件名验证
    filename: extendRules(toolRules, ['filename']),

    // 文件操作
    file: extendRules(toolRules, ['filename', 'content', 'type']),

    // 文件上传
    upload: extendRules(toolRules, ['filename', 'content']),

    // 文件下载
    download: extendRules(toolRules, ['path']),

    // 文件列表
    files: extendRules(toolRules, ['path'])
};
