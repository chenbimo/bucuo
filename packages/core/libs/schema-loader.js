/**
 * Schema 加载器
 * 负责加载和解析 JSON 格式的验证规则配置
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 缓存已加载的schema
 */
const schemaCache = new Map();

/**
 * 加载JSON schema文件
 * @param {string} filePath - JSON文件路径
 * @returns {Object} 解析后的schema对象
 */
function loadJsonSchema(filePath) {
    if (schemaCache.has(filePath)) {
        return schemaCache.get(filePath);
    }

    try {
        const content = readFileSync(filePath, 'utf-8');
        const schema = JSON.parse(content);
        schemaCache.set(filePath, schema);
        return schema;
    } catch (error) {
        throw new Error(`Failed to load schema from ${filePath}: ${error.message}`);
    }
}

/**
 * 解析规则引用
 * @param {string} rule - 规则字符串，可能包含引用
 * @param {Object} context - 上下文对象，包含所有可用的规则
 * @returns {string} 解析后的规则字符串
 */
function resolveRuleReference(rule, context) {
    if (typeof rule !== 'string') {
        return rule;
    }

    // 如果是引用格式 (如 "commonRules.id" 或 "userRules.username")
    if (rule.includes('.')) {
        const [poolName, fieldName] = rule.split('.');
        if (context[poolName] && context[poolName][fieldName]) {
            return context[poolName][fieldName];
        }
    }

    return rule;
}

/**
 * 构建验证规则对象
 * @param {Object} preset - 预设配置对象
 * @param {Object} context - 上下文对象，包含所有可用的规则
 * @returns {Object} 构建后的验证规则对象
 */
function buildRulesObject(preset, context) {
    const result = {};

    for (const [key, value] of Object.entries(preset)) {
        if (typeof value === 'string') {
            result[key] = resolveRuleReference(value, context);
        } else if (typeof value === 'object' && value !== null) {
            result[key] = buildRulesObject(value, context);
        } else {
            result[key] = value;
        }
    }

    return result;
}

/**
 * 创建schema加载器
 * @param {string} schemaDir - schema目录路径
 */
export function createSchemaLoader(schemaDir) {
    /**
     * 加载指定的schema文件
     * @param {string} schemaName - schema文件名（不含扩展名）
     * @returns {Object} 包含规则字段池和预设组合的对象
     */
    function loadSchema(schemaName) {
        const filePath = join(schemaDir, `${schemaName}.json`);
        const rawSchema = loadJsonSchema(filePath);

        // 构建上下文，包含当前schema的所有规则字段池
        const context = {};

        // 添加当前schema的规则池
        Object.keys(rawSchema).forEach((key) => {
            if (key.endsWith('Rules')) {
                context[key] = rawSchema[key];
            }
        });

        // 如果需要，加载并合并通用规则
        if (schemaName !== 'common') {
            try {
                const commonSchema = loadSchema('common');
                Object.assign(context, { commonRules: commonSchema.commonRules });
            } catch (error) {
                // 忽略，如果没有通用规则文件
            }
        }

        // 构建预设组合
        const presets = {};
        if (rawSchema.presets) {
            for (const [presetName, presetConfig] of Object.entries(rawSchema.presets)) {
                presets[presetName] = buildRulesObject(presetConfig, context);
            }
        }

        return {
            ...context,
            ...presets,
            // 保留原始数据以供调试
            _raw: rawSchema
        };
    }

    return { loadSchema };
}

/**
 * 扩展验证规则
 * @param {Object} baseRules - 基础验证规则
 * @param {Object} additionalRules - 额外验证规则
 * @returns {Object} 合并后的验证规则
 */
export function extendRules(baseRules, additionalRules) {
    return { ...baseRules, ...additionalRules };
}

/**
 * 创建验证规则组合
 * @param {Array<string>} fields - 要组合的字段名
 * @param {Object} rulesPool - 规则字段池
 * @returns {Object} 验证规则对象
 */
export function createRules(fields, rulesPool) {
    const rules = {};
    fields.forEach((field) => {
        if (rulesPool[field]) {
            rules[field] = rulesPool[field];
        }
    });
    return rules;
}
