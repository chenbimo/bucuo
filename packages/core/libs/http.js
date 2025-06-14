/**
 * HTTP API 处理工具库
 * 提供接口创建、验证、返回等功能
 */

import { ERROR_CODES, ERROR_MESSAGES } from './error.js';
import { validate } from './simple-validator.js';

// 重新导出 ERROR_CODES，方便其他模块使用
export { ERROR_CODES } from './error.js';

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
 * 验证 JSON 参数
 * @param {Request} request - 请求对象
 * @param {Object} rules - 验证规则对象
 * @returns {Object} 验证结果
 */
export async function validateJsonParams(request, rules) {
    try {
        // 检查 Content-Type
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return {
                success: false,
                error: createResponse(ERROR_CODES.INVALID_PARAM_FORMAT, 'Content-Type 必须是 application/json')
            };
        }

        // 解析 JSON 数据
        let data;
        try {
            data = await request.json();
        } catch (err) {
            return {
                success: false,
                error: createResponse(ERROR_CODES.INVALID_PARAM_FORMAT, '无效的 JSON 格式', err.message)
            };
        }

        // 使用简单验证器验证
        const result = validate(data, rules);
        if (!result.success) {
            return {
                success: false,
                error: createResponse(ERROR_CODES.INVALID_PARAMS, '参数验证失败', result.errors)
            };
        }

        return {
            success: true,
            data: result.data
        };
    } catch (err) {
        return {
            success: false,
            error: createResponse(ERROR_CODES.API_INTERNAL_ERROR, '验证过程中发生错误', err.message)
        };
    }
}

/**
 * 创建统一的 API 处理器（支持插件化配置）
 * @param {Object} config - API 配置对象
 * @param {string} config.name - 接口名称
 * @param {Object} config.schema - 验证规则对象（可选）
 * @param {string} config.method - HTTP 方法，'get' 或 'post'，默认为 'post'
 * @param {Function} config.handler - 处理函数
 * @returns {Function} API 处理器
 */
export function createAPI(config) {
    const { name, schema, method = 'post', handler } = config;

    if (!name || typeof name !== 'string') {
        throw new Error('API 配置必须包含 name 字段');
    }

    if (!handler || typeof handler !== 'function') {
        throw new Error('API 配置必须包含 handler 函数');
    }

    const httpMethod = method.toUpperCase();

    const apiHandler = async (context) => {
        const { request, response } = context;

        // 检查请求方法
        if (request.method !== httpMethod) {
            return createResponse(ERROR_CODES.API_METHOD_NOT_ALLOWED, `${name}: 不允许的请求方法，仅支持 ${httpMethod}`);
        }

        let data = null;

        // 如果有验证规则，进行参数验证
        if (schema) {
            if (httpMethod === 'POST' || httpMethod === 'PUT' || httpMethod === 'PATCH') {
                // 对于有 body 的请求，验证 JSON 参数
                const validation = await validateJsonParams(request, schema);
                if (!validation.success) {
                    return validation.error;
                }
                data = validation.data;
            } else {
                // 对于 GET/DELETE 等请求，验证 query 参数或 URL 参数
                const url = new URL(request.url);
                const queryParams = {};

                // 提取 query 参数
                for (const [key, value] of url.searchParams) {
                    queryParams[key] = value;
                }

                // 提取 URL 路径参数（如 /user/123 中的 123）
                const pathParts = url.pathname.split('/').filter(Boolean);
                const lastPart = pathParts[pathParts.length - 1];
                if (!isNaN(lastPart) && lastPart !== '') {
                    queryParams.id = Number(lastPart);
                }

                // 验证参数
                const result = validate(queryParams, schema);
                if (!result.success) {
                    return createResponse(ERROR_CODES.INVALID_PARAMS, `${name}: 验证失败`, result.errors);
                }
                data = result.data;
            }
        }

        try {
            // 调用处理函数
            const result = await handler(data, context);
            return result || createResponse();
        } catch (error) {
            return createResponse(ERROR_CODES.API_INTERNAL_ERROR, `${name}: 内部服务器错误`, error.message);
        }
    };

    // 添加 API 元信息
    apiHandler.__isBunflyAPI__ = true;
    apiHandler.__apiName__ = name;
    apiHandler.__apiMethod__ = httpMethod;
    apiHandler.__apiSchema__ = schema;

    return apiHandler;
}

/**
 * 创建 GET API 处理器（向后兼容）
 * @param {Object} schema - 验证规则对象（可选）
 * @param {Function} handler - 处理函数
 * @returns {Function} API 处理器
 */
export function createGetAPI(schema, handler) {
    // 如果只传了一个参数且是函数，说明没有 schema
    if (typeof schema === 'function' && !handler) {
        handler = schema;
        schema = null;
    }

    return createAPI({
        name: 'GET API (Legacy)',
        schema,
        method: 'get',
        handler
    });
}

/**
 * 创建 POST API 处理器（向后兼容）
 * @param {Object} schema - 验证规则对象
 * @param {Function} handler - 处理函数
 * @returns {Function} API 处理器
 */
export function createPostAPI(schema, handler) {
    return createAPI({
        name: 'POST API (Legacy)',
        schema,
        method: 'post',
        handler
    });
}
