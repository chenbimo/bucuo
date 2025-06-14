/**
 * 验证规则构建器
 * 专注于提供链式 API 来构建 Zod 验证规则
 *
 * 职责：
 * - 提供 ValidationBuilder 类用于构建复杂验证规则
 * - 提供便捷的 createValidator() 函数
 * - 兼容性的验证器导出
 *
 * 注意：HTTP 相关功能在 http.js，简单验证器在 simple-validator.js
 */

import { z } from 'zod';

/**
 * 验证规则构建器
 */
export class ValidationBuilder {
    constructor() {
        this.schema = {};
    }

    /**
     * 字符串验证
     */
    string(key, options = {}) {
        let validator = z.string();

        if (options.required !== false) {
            validator = validator.min(1, `${key} 是必填项`);
        }

        if (options.min) {
            validator = validator.min(options.min, `${key} 至少需要 ${options.min} 个字符`);
        }

        if (options.max) {
            validator = validator.max(options.max, `${key} 最多只能有 ${options.max} 个字符`);
        }

        if (options.email) {
            validator = validator.email(`${key} 必须是有效的邮箱格式`);
        }

        if (options.url) {
            validator = validator.url(`${key} 必须是有效的 URL 格式`);
        }

        if (options.pattern) {
            validator = validator.regex(options.pattern, `${key} 格式不正确`);
        }

        if (options.optional) {
            validator = validator.optional();
        }

        if (options.default !== undefined) {
            validator = validator.default(options.default);
        }

        this.schema[key] = validator;
        return this;
    }

    /**
     * 数字验证
     */
    number(key, options = {}) {
        let validator = z.number();

        if (options.int) {
            validator = validator.int(`${key} 必须是整数`);
        }

        if (options.min !== undefined) {
            validator = validator.min(options.min, `${key} 至少需要 ${options.min}`);
        }

        if (options.max !== undefined) {
            validator = validator.max(options.max, `${key} 最大值为 ${options.max}`);
        }

        if (options.positive) {
            validator = validator.positive(`${key} 必须是正数`);
        }

        if (options.optional) {
            validator = validator.optional();
        }

        if (options.default !== undefined) {
            validator = validator.default(options.default);
        }

        this.schema[key] = validator;
        return this;
    }

    /**
     * 布尔值验证
     */
    boolean(key, options = {}) {
        let validator = z.boolean();

        if (options.optional) {
            validator = validator.optional();
        }

        if (options.default !== undefined) {
            validator = validator.default(options.default);
        }

        this.schema[key] = validator;
        return this;
    }

    /**
     * 数组验证
     */
    array(key, itemType, options = {}) {
        let validator = z.array(itemType);

        if (options.min !== undefined) {
            validator = validator.min(options.min, `${key} 至少需要 ${options.min} 个元素`);
        }

        if (options.max !== undefined) {
            validator = validator.max(options.max, `${key} 最多只能有 ${options.max} 个元素`);
        }

        if (options.optional) {
            validator = validator.optional();
        }

        if (options.default !== undefined) {
            validator = validator.default(options.default);
        }

        this.schema[key] = validator;
        return this;
    }

    /**
     * 枚举验证
     */
    enum(key, values, options = {}) {
        let validator = z.enum(values, {
            errorMap: () => ({ message: `${key} 必须是以下值之一：${values.join('、')}` })
        });

        if (options.optional) {
            validator = validator.optional();
        }

        if (options.default !== undefined) {
            validator = validator.default(options.default);
        }

        this.schema[key] = validator;
        return this;
    }

    /**
     * 对象验证
     */
    object(key, schema, options = {}) {
        let validator = z.object(schema);

        if (options.optional) {
            validator = validator.optional();
        }

        if (options.default !== undefined) {
            validator = validator.default(options.default);
        }

        this.schema[key] = validator;
        return this;
    }

    /**
     * 构建最终的 zod schema
     */
    build() {
        return z.object(this.schema);
    }
}

/**
 * 创建验证器的便捷函数
 */
export function createValidator() {
    return new ValidationBuilder();
}

/**
 * 预定义的常用验证器已迁移到 schema 目录
 * 此处保留为兼容性，建议使用 schema 目录中的验证器
 */
export const validators = {
    // 空验证（无参数）- 兼容性保留
    empty: () => z.object({})
};
