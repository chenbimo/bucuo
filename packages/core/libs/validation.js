/**
 * 通用参数验证库
 * 提供更简洁的验证方式，无需直接使用 zod
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
 * 预定义的常用验证器
 */
export const validators = {
    // ID 验证
    id: () => createValidator().number('id', { int: true, positive: true }).build(),

    // 分页验证
    pagination: () => createValidator()
        .number('page', { int: true, min: 1, default: 1, optional: true })
        .number('limit', { int: true, min: 1, max: 100, default: 10, optional: true })
        .build(),

    // 用户登录
    userLogin: () => createValidator()
        .string('username', { min: 1 })
        .string('password', { min: 6 })
        .build(),

    // 用户创建
    userCreate: () => createValidator()
        .string('username', { min: 1 })
        .string('password', { min: 6 })
        .string('email', { email: true, optional: true })
        .string('nickname', { optional: true })
        .build(),

    // 用户更新
    userUpdate: () => createValidator()
        .number('id', { int: true, positive: true })
        .string('username', { min: 1, optional: true })
        .string('email', { email: true, optional: true })
        .string('nickname', { optional: true })
        .build(),

    // 用户资料
    userProfile: () => createValidator()
        .string('token', { optional: true })
        .build(),

    // 文件操作
    file: () => createValidator()
        .string('filename', { min: 1 })
        .string('content', { optional: true })
        .string('type', { optional: true })
        .build(),

    // 空验证（无参数）
    empty: () => z.object({})
};

/**
 * 创建标准的 API 响应格式
 */
export const createResponse = (data = null, message = '成功', code = 200) => {
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
export const createError = (message = '错误', code = 400, details = null) => {
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
 */
export async function validateJsonParams(request, schema) {
    try {
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return {
                success: false,
                error: createError('Content-Type 必须是 application/json', 400)
            };
        }

        let data;
        try {
            data = await request.json();
        } catch (err) {
            return {
                success: false,
                error: createError('JSON 格式无效', 400, err.message)
            };
        }

        const result = schema.safeParse(data);
        if (!result.success) {
            return {
                success: false,
                error: createError('参数验证失败', 400, result.error.errors)
            };
        }

        return {
            success: true,
            data: result.data
        };
    } catch (err) {
        return {
            success: false,
            error: createError('验证出错', 500, err.message)
        };
    }
}

/**
 * 创建 POST API 处理器
 */
export function createPostAPI(validator, handler) {
    const schema = typeof validator === 'function' ? validator() : validator;

    const apiHandler = async (context) => {
        const { request, response } = context;

        if (request.method !== 'POST') {
            response.status = 405;
            return createError('不支持的请求方法，仅支持 POST', 405);
        }

        const validation = await validateJsonParams(request, schema);
        if (!validation.success) {
            response.status = validation.error.code;
            return validation.error;
        }

        try {
            const result = await handler(validation.data, context);
            return result || createResponse();
        } catch (error) {
            response.status = 500;
            return createError('服务器内部错误', 500, error.message);
        }
    };

    // 添加标记表示这是通过 createPostAPI 包裹的 API
    apiHandler.__isBunflyAPI__ = true;
    apiHandler.__apiType__ = 'POST';

    return apiHandler;
}

/**
 * 创建 GET API 处理器
 */
export function createGetAPI(validator, handler) {
    const schema = typeof validator === 'function' ? validator() : validator;

    const apiHandler = async (context) => {
        const { request, response } = context;

        if (request.method !== 'GET') {
            response.status = 405;
            return createError('不支持的请求方法，仅支持 GET', 405);
        }

        let data = null;

        if (schema) {
            const url = new URL(request.url);
            const queryParams = {};

            for (const [key, value] of url.searchParams) {
                if (!isNaN(value) && value !== '') {
                    queryParams[key] = Number(value);
                } else {
                    queryParams[key] = value;
                }
            }

            const pathParts = url.pathname.split('/').filter(Boolean);
            const lastPart = pathParts[pathParts.length - 1];
            if (!isNaN(lastPart) && lastPart !== '') {
                queryParams.id = Number(lastPart);
            }

            const result = schema.safeParse(queryParams);
            if (!result.success) {
                response.status = 400;
                return createError('参数验证失败', 400, result.error.errors);
            }
            data = result.data;
        }

        try {
            const result = await handler(data, context);
            return result || createResponse();
        } catch (error) {
            response.status = 500;
            return createError('服务器内部错误', 500, error.message);
        }
    };

    // 添加标记表示这是通过 createGetAPI 包裹的 API
    apiHandler.__isBunflyAPI__ = true;
    apiHandler.__apiType__ = 'GET';

    return apiHandler;
}
