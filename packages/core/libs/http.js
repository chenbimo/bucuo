/**
 * HTTP API 处理工具库
 * 提供接口创建、验证、返回等功能
 */

import { z } from 'zod';
import { ERROR_CODES, ERROR_MESSAGES } from './error.js';

/**
 * 创建统一响应对象
 * @param {number} code - 响应码
 * @param {string} msg - 响应消息
 * @param {any} data - 响应数据
 * @param {any} detail - 详细信息
 * @param {Object} options - 其他选项，会与前4个参数合并，但不能覆盖它们
 * @returns {Object} 响应对象
 */
export function createResponse(code = ERROR_CODES.SUCCESS, msg = null, data = null, detail = null, options = {}) {
    const defaultMessage = msg || ERROR_MESSAGES[code] || '未知状态';

    // 基础响应对象
    const response = {
        code,
        msg: defaultMessage,
        data,
        detail,
        timestamp: new Date().toISOString()
    };

    // 合并 options，但不覆盖基础参数
    const { code: _, msg: __, data: ___, detail: ____, ...safeOptions } = options;

    return {
        ...safeOptions,
        ...response
    };
}

/**
 * 创建兼容的 API 响应格式（向后兼容）
 * @param {any} data - 响应数据
 * @param {string} message - 响应消息
 * @param {number} code - 响应码（默认使用成功码）
 */
export const createApiResponse = (data = null, message = '成功', code = ERROR_CODES.SUCCESS) => {
    return createResponse(code, message, data);
};

/**
 * 创建错误响应
 * @param {string|number} messageOrCode - 错误信息或错误码
 * @param {number|string} codeOrMessage - 错误码或错误信息
 * @param {any} details - 错误详情
 */
export const createError = (messageOrCode = '错误', codeOrMessage = ERROR_CODES.GENERAL_ERROR, details = null) => {
    // 兼容旧版本调用方式：createError(message, code, details)
    if (typeof messageOrCode === 'string' && typeof codeOrMessage === 'number') {
        return createResponse(codeOrMessage, messageOrCode, null, details);
    }

    // 新版本调用方式：createError(code, message, details)
    if (typeof messageOrCode === 'number') {
        return createResponse(messageOrCode, codeOrMessage, null, details);
    }

    // 默认处理
    return createResponse(ERROR_CODES.GENERAL_ERROR, messageOrCode, null, codeOrMessage);
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
                error: createError(ERROR_CODES.INVALID_PARAM_FORMAT, 'Content-Type 必须是 application/json')
            };
        }

        // 解析 JSON 数据
        let data;
        try {
            data = await request.json();
        } catch (err) {
            return {
                success: false,
                error: createError(ERROR_CODES.INVALID_PARAM_FORMAT, '无效的 JSON 格式', err.message)
            };
        }

        // Zod 验证
        const result = schema.safeParse(data);
        if (!result.success) {
            return {
                success: false,
                error: createError(ERROR_CODES.INVALID_PARAMS, '参数验证失败', result.error.errors)
            };
        }

        return {
            success: true,
            data: result.data
        };
    } catch (err) {
        return {
            success: false,
            error: createError(ERROR_CODES.API_INTERNAL_ERROR, '验证过程中发生错误', err.message)
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
            return createError('内部服务器错误', 500, error.message);
        }
    };

    // 添加标记表示这是通过 createPostAPI 包裹的 API
    apiHandler.__isBunflyAPI__ = true;
    apiHandler.__apiType__ = 'POST';

    return apiHandler;
}

/**
 * 创建标准的 GET API 处理器
 * @param {ZodSchema} schema - 验证模式（可选）
 * @param {Function} handler - 处理函数
 * @returns {Function} API 处理器
 */
export function createGetAPI(schema, handler) {
    // 如果只传了一个参数且是函数，说明没有 schema
    if (typeof schema === 'function' && !handler) {
        handler = schema;
        schema = null;
    }

    const apiHandler = async (context) => {
        const { request, response } = context;

        // 检查请求方法
        if (request.method !== 'GET') {
            response.status = 405;
            return createError('不允许的请求方法，仅支持 GET', 405);
        }

        let data = null;

        // 如果有验证模式，验证查询参数
        if (schema) {
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
                return createError('验证失败', 400, result.error.errors);
            }
            data = result.data;
        }

        try {
            // 调用处理函数
            const result = await handler(data, context);
            return result || createResponse();
        } catch (error) {
            response.status = 500;
            return createError('内部服务器错误', 500, error.message);
        }
    };

    // 添加标记表示这是通过 createGetAPI 包裹的 API
    apiHandler.__isBunflyAPI__ = true;
    apiHandler.__apiType__ = 'GET';

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
                    return createError('验证失败', 400, result.error.errors);
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
            return createError('内部服务器错误', 500, error.message);
        }
    };

    // 添加标记表示这是通过 createAPI 包裹的 API
    apiHandler.__isBunflyAPI__ = true;
    apiHandler.__apiType__ = allowedMethods.join(',');

    return apiHandler;
}
