/**
 * 简单 Schema 工具
 * 利用 Bun 原生 JSON 导入能力，处理 schema 引用和组合
 */

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
 * 处理已导入的 JSON schema 对象
 * @param {Object} rawSchema - 已导入的 JSON schema 对象
 * @param {Object} commonRules - 可选的通用规则对象（来自 common.json）
 * @returns {Object} 包含规则字段池和预设组合的对象
 */
export function processSchema(rawSchema, commonRules = null) {
    // 构建上下文，包含当前schema的所有规则字段池
    const context = {};

    // 添加通用规则
    if (commonRules) {
        context.commonRules = commonRules;
    }

    // 添加当前schema的规则池
    Object.keys(rawSchema).forEach((key) => {
        if (key.endsWith('Rules')) {
            context[key] = rawSchema[key];
        }
    });

    // 构建预设组合
    const result = { ...context };
    if (rawSchema.presets) {
        for (const [presetName, presetConfig] of Object.entries(rawSchema.presets)) {
            result[presetName] = buildRulesObject(presetConfig, context);
        }
    }

    return result;
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

/**
 * 向后兼容的 loadSchema 函数（已弃用）
 * @deprecated 使用 processSchema + 直接 import JSON 替代
 * @param {string} filePath - JSON文件的绝对路径
 * @returns {Object} 包含规则字段池和预设组合的对象
 */
export function loadSchema(filePath) {
    console.warn('loadSchema() is deprecated. Use direct JSON import + processSchema() instead.');
    // 这里保留向后兼容，但建议迁移到新的方式
    import(filePath).then((module) => {
        return processSchema(module.default || module);
    });
}
