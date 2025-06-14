/**
 * Bunfly Core Libraries
 *
 * 这个目录用于存放框架自己实现的库，避免依赖第三方包
 */

// 导出验证工具
export * from './validation.js';
export * from './validator.js';

// 导出 HTTP API 工具
export * from './http.js';

// 导出JWT工具
export * from './jwt.js';

// 导出日志工具
export * from './logger.js';

// 导出缓存工具
export * from './cache.js';

// 导出 schema 中的通用验证模式
export { commonSchemas } from '../schema/common.js';

export const bunflyLibs = {
    version: '1.0.0',
    description: 'Bunfly core libraries directory'
};
