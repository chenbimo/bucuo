/**
 * Core Schema 统一导出
 * 基于JSON配置的验证规则加载
 */

import { createSchemaLoader } from '../libs/schema-loader.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 创建schema加载器
const { loadSchema } = createSchemaLoader(__dirname);

// 加载各个schema
const commonSchema = loadSchema('common');
const healthSchema = loadSchema('health');
const toolSchema = loadSchema('tool');
const debugSchema = loadSchema('debug');

// 导出规则字段池
export const { commonRules } = commonSchema;
export const { healthRules } = healthSchema;
export const { toolRules } = toolSchema;
export const { debugRules } = debugSchema;

// 导出预设组合
export const { pagination, id, filename } = commonSchema;
export const common = { pagination, id, filename };

export const { check, status, info } = healthSchema;
export const health = { check, status, info };

export const { filename: toolFilename, file, upload, download, files } = toolSchema;
export const tool = { filename: toolFilename, file, upload, download, files };

export const { routes } = debugSchema;
export const debug = { routes };

// 导出工具函数
export { extendRules, createRules } from '../libs/schema-loader.js';
