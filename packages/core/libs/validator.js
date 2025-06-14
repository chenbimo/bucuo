/**
 * Zod 验证工具库
 * 提供通用的参数验证功能
 */

import { z } from 'zod';

/**
 * 创建标准的 API 响应格式
 */
export const createResponse = (data = null, message = 'success', code = 200) => {
    return {
        code,
        message,
        data,
        timestamp: Date.now()
    };
};

/**
 * 创建错误响应
 */
export const createError = (message = 'error', code = 400, details = null) => {
    return {
        code,
        message,
        error: true,
        details,
        timestamp: Date.now()
    };
};

/**
 * 验证 JSON 参数
 * @param {Request} request - 请求对象
 * @param {ZodSchema} schema - Zod 验证模式
 * @returns {Object} 验证结果
 */
export async function validateJsonParams(request, schema) {
    try {
        // 检查 Content-Type
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return {
                success: false,
                error: createError('Content-Type must be application/json', 400)
            };
        }

        // 解析 JSON 数据
        let data;
        try {
            data = await request.json();
        } catch (err) {
            return {
                success: false,
                error: createError('Invalid JSON format', 400, err.message)
            };
        }

        // Zod 验证
        const result = schema.safeParse(data);
        if (!result.success) {
            return {
                success: false,
                error: createError('Validation failed', 400, result.error.errors)
            };
        }

        return {
            success: true,
            data: result.data
        };
    } catch (err) {
        return {
            success: false,
            error: createError('Validation error', 500, err.message)
        };
    }
}

/**
 * 创建标准的 POST API 处理器
 * @param {ZodSchema} schema - 验证模式
 * @param {Function} handler - 处理函数
 * @returns {Function} API 处理器
 */
export function createPostAPI(schema, handler) {
    const apiHandler = async (context) => {
        const { request, response } = context;

        // 检查请求方法
        if (request.method !== 'POST') {
            response.status = 405;
            return createError('不允许的请求方法，仅支持 POST', 405);
        }

        // 验证参数
        const validation = await validateJsonParams(request, schema);
        if (!validation.success) {
            response.status = validation.error.code;
            return validation.error;
        }

        try {
            // 调用处理函数
            const result = await handler(validation.data, context);
            return result || createResponse();
        } catch (error) {
            response.status = 500;
            return createError('Internal server error', 500, error.message);
        }
    };

    // 添加标记表示这是通过 createPostAPI 包裹的 API
    apiHandler.__isBunflyAPI__ = true;
    apiHandler.__apiType__ = 'POST';

    return apiHandler;
}

/**
 * 创建支持多种 HTTP 方法的 API 处理器
 * @param {Object} config - 配置对象
 * @param {string|string[]} config.methods - 支持的 HTTP 方法
 * @param {ZodSchema} config.schema - 验证模式（可选）
 * @param {Function} config.handler - 处理函数
 * @returns {Function} API 处理器
 */
export function createAPI(config) {
    const { methods, schema, handler } = config;
    const allowedMethods = Array.isArray(methods) ? methods : [methods];

    const apiHandler = async (context) => {
        const { request, response } = context;

        // 检查请求方法
        if (!allowedMethods.includes(request.method)) {
            response.status = 405;
            return createError(`不允许的请求方法，支持的方法: ${allowedMethods.join(', ')}`, 405);
        }

        let data = null;

        // 如果需要验证参数
        if (schema) {
            if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
                // 对于有 body 的请求，验证 JSON 参数
                const validation = await validateJsonParams(request, schema);
                if (!validation.success) {
                    response.status = validation.error.code;
                    return validation.error;
                }
                data = validation.data;
            } else {
                // 对于 GET/DELETE 等请求，验证 query 参数或 URL 参数
                const url = new URL(request.url);
                const queryParams = {};

                // 提取 query 参数
                for (const [key, value] of url.searchParams) {
                    // 尝试转换数字
                    if (!isNaN(value) && value !== '') {
                        queryParams[key] = Number(value);
                    } else {
                        queryParams[key] = value;
                    }
                }

                // 提取 URL 路径参数（如 /user/123 中的 123）
                const pathParts = url.pathname.split('/').filter(Boolean);
                const lastPart = pathParts[pathParts.length - 1];
                if (!isNaN(lastPart) && lastPart !== '') {
                    queryParams.id = Number(lastPart);
                }

                // 验证参数
                const result = schema.safeParse(queryParams);
                if (!result.success) {
                    response.status = 400;
                    return createError('Validation failed', 400, result.error.errors);
                }
                data = result.data;
            }
        }

        try {
            // 调用处理函数
            const result = await handler(data, context);
            return result || createResponse();
        } catch (error) {
            response.status = 500;
            return createError('Internal server error', 500, error.message);
        }
    };

    // 添加标记表示这是通过 createAPI 包裹的 API
    apiHandler.__isBunflyAPI__ = true;
    apiHandler.__apiType__ = allowedMethods.join(',');

    return apiHandler;
}

/**
 * 常用的 Zod 验证模式
 */
export const commonSchemas = {
    // ID 参数
    id: z.object({
        id: z.number().int().positive('ID must be a positive integer')
    }),

    // 分页参数
    pagination: z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(10)
    }),

    // 用户登录
    userLogin: z.object({
        username: z.string().min(1, 'Username is required'),
        password: z.string().min(6, 'Password must be at least 6 characters')
    }),

    // 用户创建
    userCreate: z.object({
        username: z.string().min(1, 'Username is required'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        email: z.string().email('Invalid email format').optional(),
        nickname: z.string().optional()
    }),

    // 用户更新
    userUpdate: z.object({
        id: z.number().int().positive('ID must be a positive integer'),
        username: z.string().min(1).optional(),
        email: z.string().email().optional(),
        nickname: z.string().optional()
    }),

    // 文件上传
    fileUpload: z.object({
        filename: z.string().min(1, 'Filename is required'),
        content: z.string().optional(),
        type: z.string().optional()
    }),

    // 文件操作
    fileOperation: z.object({
        filename: z.string().min(1, 'Filename is required')
    })
};
