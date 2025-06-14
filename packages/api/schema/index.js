/**
 * API 验证规则统一导出
 * 基于JSON配置的验证规则加载
 */

import { createSchemaLoader } from '../../core/libs/schema-loader.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 创建schema加载器
const { loadSchema } = createSchemaLoader(__dirname);

// 加载各个schema
const userSchema = loadSchema('user');
const statsSchema = loadSchema('stats');

// 从core导出common
export { common } from '../../core/schema/index.js';

// 导出用户相关
export const { userRules } = userSchema;
export const { register, login, update, query, detail, batchUpdate, profile } = userSchema;
export const user = { register, login, update, query, detail, batchUpdate, profile };

// 导出统计相关
export const { statsRules } = statsSchema;
export const { system, requests, paths, methods } = statsSchema;
export const stats = { system, requests, paths, methods };
