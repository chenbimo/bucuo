/**
 * 简单 Schema 工具
 * 向后兼容工具，推荐直接使用 import JSON + 简单字段引用
 */

/**
 * 创建验证规则组合（向后兼容工具）
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
