/**
 * 数据验证工具库
 * 专注于数据验证功能，提供各种验证工具函数
 *
 * 职责：
 * - 单个数据验证 (validateData)
 * - 批量数据验证 (validateBatch)
 * - 字段验证 (validateFields)
 * - 条件验证 (validateIf)
 * - 异步验证 (validateDataAsync)
 * - 自定义验证器创建 (createCustomValidator)
 *
 * 注意：验证规则构建在 validation.js，HTTP 处理在 http.js
 */

import { z } from 'zod';

/**
 * 验证数据
 * @param {any} data - 要验证的数据
 * @param {ZodSchema} schema - Zod 验证模式
 * @returns {Object} 验证结果
 */
export function validateData(data, schema) {
    try {
        const result = schema.safeParse(data);
        if (!result.success) {
            return {
                success: false,
                errors: result.error.errors
            };
        }

        return {
            success: true,
            data: result.data
        };
    } catch (err) {
        return {
            success: false,
            errors: [{ message: err.message, path: [] }]
        };
    }
}

/**
 * 批量验证数据
 * @param {Array} items - 要验证的数据数组
 * @param {ZodSchema} schema - Zod 验证模式
 * @returns {Object} 验证结果
 */
export function validateBatch(items, schema) {
    const results = [];
    const errors = [];

    items.forEach((item, index) => {
        const result = validateData(item, schema);
        if (result.success) {
            results.push(result.data);
        } else {
            errors.push({
                index,
                errors: result.errors
            });
        }
    });

    return {
        success: errors.length === 0,
        results,
        errors
    };
}

/**
 * 验证对象的特定字段
 * @param {Object} obj - 要验证的对象
 * @param {Object} fieldSchemas - 字段验证规则映射
 * @returns {Object} 验证结果
 */
export function validateFields(obj, fieldSchemas) {
    const results = {};
    const errors = {};
    let hasErrors = false;

    for (const [field, schema] of Object.entries(fieldSchemas)) {
        const value = obj[field];
        const result = validateData(value, schema);

        if (result.success) {
            results[field] = result.data;
        } else {
            errors[field] = result.errors;
            hasErrors = true;
        }
    }

    return {
        success: !hasErrors,
        data: results,
        errors: hasErrors ? errors : null
    };
}

/**
 * 条件验证 - 根据条件决定是否验证
 * @param {any} data - 要验证的数据
 * @param {ZodSchema} schema - Zod 验证模式
 * @param {Function} condition - 条件函数
 * @returns {Object} 验证结果
 */
export function validateIf(data, schema, condition) {
    if (!condition(data)) {
        return {
            success: true,
            data: data,
            skipped: true
        };
    }

    return validateData(data, schema);
}

/**
 * 异步验证数据
 * @param {any} data - 要验证的数据
 * @param {ZodSchema} schema - Zod 验证模式
 * @returns {Promise<Object>} 验证结果
 */
export async function validateDataAsync(data, schema) {
    try {
        const result = await schema.safeParseAsync(data);
        if (!result.success) {
            return {
                success: false,
                errors: result.error.errors
            };
        }

        return {
            success: true,
            data: result.data
        };
    } catch (err) {
        return {
            success: false,
            errors: [{ message: err.message, path: [] }]
        };
    }
}

/**
 * 创建自定义验证器
 * @param {Function} validatorFn - 验证函数
 * @param {string} errorMessage - 错误消息
 * @returns {ZodSchema} Zod schema
 */
export function createCustomValidator(validatorFn, errorMessage = '验证失败') {
    return z.any().refine(validatorFn, { message: errorMessage });
}
