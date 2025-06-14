/**
 * 核心通用验证规则
 * 提供常用的字段验证规则
 */

/**
 * 通用字段验证规则
 */
export const commonRules = {
    // 基础类型
    id: 'number,ID,1,999999999',
    email: 'string,邮箱,5,100,^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    phone: 'string,手机号,11,11,^1[3-9]\\d{9}$',

    // 分页相关
    page: 'number,页码,1,9999',
    limit: 'number,每页数量,1,100',

    // 文本相关
    title: 'string,标题,1,200',
    description: 'string,描述,0,500',
    keyword: 'string,关键词,1,50',

    // 状态相关
    status: 'string,状态,1,20',
    enabled: 'number,启用状态,0,1',

    // 时间相关
    date: 'string,日期,10,10,^\\d{4}-\\d{2}-\\d{2}$',
    datetime: 'string,日期时间,19,25,^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}',

    // 文件相关
    filename: 'string,文件名,1,255',
    url: 'string,网址,5,500,^https?://'
};

/**
 * 分页验证规则组合
 */
export const paginationRules = {
    page: commonRules.page,
    limit: commonRules.limit
};

/**
 * 创建验证规则组合
 * @param {Array<string>} fields - 要组合的字段名
 * @returns {Object} 验证规则对象
 */
export function createRules(fields) {
    const rules = {};
    fields.forEach((field) => {
        if (commonRules[field]) {
            rules[field] = commonRules[field];
        }
    });
    return rules;
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
 * 常用规则组合
 */
export const common = {
    // ID 参数
    id: {
        id: commonRules.id
    },

    // 分页参数
    pagination: paginationRules,

    // 文件名参数
    filename: {
        filename: commonRules.filename
    }
};
