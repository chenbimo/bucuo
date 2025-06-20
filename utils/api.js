import { Code } from '../config/code.js';
export class Api {
    // GET 方法
    static GET(name, fields = {}, required = [], handler) {
        // 支持参数重载：如果第二个参数是函数，则没有 fields 和 required
        if (typeof fields === 'function') {
            handler = fields;
            fields = {};
            required = [];
        } else if (typeof required === 'function') {
            handler = required;
            required = [];
        }

        return {
            method: 'GET',
            name: name,
            fields: fields,
            required: required,
            handler: this.wrapHandler(handler)
        };
    }

    // POST 方法
    static POST(name, fields = {}, required = [], handler) {
        if (typeof fields === 'function') {
            handler = fields;
            fields = {};
            required = [];
        } else if (typeof required === 'function') {
            handler = required;
            required = [];
        }

        return {
            method: 'POST',
            name: name,
            fields: fields,
            required: required,
            handler: this.wrapHandler(handler)
        };
    }

    // 包装处理器，自动处理异常和响应格式
    static wrapHandler(handler) {
        return async (bucuo, req) => {
            try {
                const result = await handler(bucuo, req);

                // 如果返回的结果已经包含 code 字段，直接返回
                if (result && typeof result === 'object' && 'code' in result) {
                    return result;
                }

                // 否则自动包装为成功响应
                return {
                    ...Code.SUCCESS,
                    data: result || {}
                };
            } catch (error) {
                // 记录错误日志
                bucuo._logger?.error({
                    ...Code.API_INTERNAL_ERROR,
                    error: error.message,
                    stack: error.stack,
                    url: req.url || ''
                });

                // 返回错误响应
                return Code.API_INTERNAL_ERROR;
            }
        };
    }
}
