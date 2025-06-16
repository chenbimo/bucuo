import { Code } from '../config/code.js';
import { Validator } from './validator.js';

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
                error: Res(Code.INVALID_PARAM_FORMAT, 'Content-Type 必须是 application/json')
            };
        }

        // 解析 JSON 数据
        let data;
        try {
            data = await request.json();
        } catch (err) {
            return {
                success: false,
                error: Res(Code.INVALID_PARAM_FORMAT, '无效的 JSON 格式', err.message)
            };
        }

        // 使用简单验证器验证
        const result = Validator(data, rules);
        if (!result.success) {
            return {
                success: false,
                error: Res(Code.INVALID_PARAMS, '参数验证失败', result.errors)
            };
        }

        return {
            success: true,
            data: result.data
        };
    } catch (err) {
        return {
            success: false,
            error: Res(Code.API_INTERNAL_ERROR, '验证过程中发生错误', err.message)
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
export function Api(config) {
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
            return Res(Code.API_METHOD_NOT_ALLOWED);
        }

        let data = null;

        // 如果有验证规则，进行参数验证
        if (schema) {
            if (httpMethod === 'POST') {
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
                const result = Validator(queryParams, schema);
                if (!result.success) {
                    return Res(Code.INVALID_PARAMS, `${name}: 验证失败`, result.errors);
                }
                data = result.data;
            }
        }

        try {
            // 调用处理函数
            const result = await handler(data, context);
            return result || Res();
        } catch (error) {
            return Res(Code.API_INTERNAL_ERROR, `${name}: 内部服务器错误`, error.message);
        }
    };

    // 添加 API 元信息
    apiHandler.__isBunflyAPI__ = true;
    apiHandler.__apiName__ = name;
    apiHandler.__apiMethod__ = httpMethod;
    apiHandler.__apiSchema__ = schema;

    return apiHandler;
}
