/**
 * Zod 验证工具库
 * 专注于数据验证功能
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
