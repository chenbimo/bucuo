/**
 * 错误码管理
 * 统一管理系统中的所有错误码和错误信息
 * 
 * 错误码规范：
 * - 0: 成功
 * - 1: 通用失败
 * - 10-99: 内部系统错误
 * - 100+: 用户自定义错误
 */

/**
 * 错误码常量定义
 */
export const ERROR_CODES = {
    // 成功状态
    SUCCESS: 0,
    
    // 通用错误
    GENERAL_ERROR: 1,
    
    // 内部系统错误 (10-99)
    // 接口相关错误 (10-19)
    API_NOT_FOUND: 10,
    API_METHOD_NOT_ALLOWED: 11,
    API_INTERNAL_ERROR: 12,
    API_TIMEOUT: 13,
    API_RATE_LIMITED: 14,
    
    // 参数验证错误 (20-29)
    INVALID_PARAMS: 20,
    MISSING_REQUIRED_PARAMS: 21,
    INVALID_PARAM_TYPE: 22,
    PARAM_OUT_OF_RANGE: 23,
    INVALID_PARAM_FORMAT: 24,
    
    // 认证授权错误 (30-39)
    UNAUTHORIZED: 30,
    TOKEN_EXPIRED: 31,
    TOKEN_INVALID: 32,
    PERMISSION_DENIED: 33,
    LOGIN_REQUIRED: 34,
    
    // 文件操作错误 (40-49)
    FILE_NOT_FOUND: 40,
    FILE_READ_ERROR: 41,
    FILE_WRITE_ERROR: 42,
    FILE_UPLOAD_ERROR: 43,
    FILE_SIZE_EXCEEDED: 44,
    FILE_TYPE_NOT_ALLOWED: 45,
    
    // 数据库错误 (50-59)
    DATABASE_ERROR: 50,
    DATABASE_CONNECTION_ERROR: 51,
    DATABASE_QUERY_ERROR: 52,
    DATABASE_TRANSACTION_ERROR: 53,
    
    // 缓存错误 (60-69)
    CACHE_ERROR: 60,
    CACHE_CONNECTION_ERROR: 61,
    CACHE_SET_ERROR: 62,
    CACHE_GET_ERROR: 63,
    
    // 网络错误 (70-79)
    NETWORK_ERROR: 70,
    REQUEST_TIMEOUT: 71,
    CONNECTION_REFUSED: 72,
    
    // 服务器错误 (80-89)
    SERVER_ERROR: 80,
    SERVICE_UNAVAILABLE: 81,
    MAINTENANCE_MODE: 82,
    
    // 配置错误 (90-99)
    CONFIG_ERROR: 90,
    INVALID_CONFIG: 91,
    MISSING_CONFIG: 92,
    
    // 用户自定义错误起始点 (100+)
    USER_DEFINED_START: 100
};

/**
 * 错误信息映射
 */
export const ERROR_MESSAGES = {
    [ERROR_CODES.SUCCESS]: '操作成功',
    [ERROR_CODES.GENERAL_ERROR]: '操作失败',
    
    // 接口相关错误
    [ERROR_CODES.API_NOT_FOUND]: '接口不存在',
    [ERROR_CODES.API_METHOD_NOT_ALLOWED]: '请求方法不被允许',
    [ERROR_CODES.API_INTERNAL_ERROR]: '接口内部错误',
    [ERROR_CODES.API_TIMEOUT]: '接口请求超时',
    [ERROR_CODES.API_RATE_LIMITED]: '请求频率超限',
    
    // 参数验证错误
    [ERROR_CODES.INVALID_PARAMS]: '参数验证失败',
    [ERROR_CODES.MISSING_REQUIRED_PARAMS]: '缺少必需参数',
    [ERROR_CODES.INVALID_PARAM_TYPE]: '参数类型错误',
    [ERROR_CODES.PARAM_OUT_OF_RANGE]: '参数值超出范围',
    [ERROR_CODES.INVALID_PARAM_FORMAT]: '参数格式错误',
    
    // 认证授权错误
    [ERROR_CODES.UNAUTHORIZED]: '未授权访问',
    [ERROR_CODES.TOKEN_EXPIRED]: '令牌已过期',
    [ERROR_CODES.TOKEN_INVALID]: '令牌无效',
    [ERROR_CODES.PERMISSION_DENIED]: '权限不足',
    [ERROR_CODES.LOGIN_REQUIRED]: '需要登录',
    
    // 文件操作错误
    [ERROR_CODES.FILE_NOT_FOUND]: '文件不存在',
    [ERROR_CODES.FILE_READ_ERROR]: '文件读取失败',
    [ERROR_CODES.FILE_WRITE_ERROR]: '文件写入失败',
    [ERROR_CODES.FILE_UPLOAD_ERROR]: '文件上传失败',
    [ERROR_CODES.FILE_SIZE_EXCEEDED]: '文件大小超出限制',
    [ERROR_CODES.FILE_TYPE_NOT_ALLOWED]: '文件类型不被允许',
    
    // 数据库错误
    [ERROR_CODES.DATABASE_ERROR]: '数据库操作失败',
    [ERROR_CODES.DATABASE_CONNECTION_ERROR]: '数据库连接失败',
    [ERROR_CODES.DATABASE_QUERY_ERROR]: '数据库查询失败',
    [ERROR_CODES.DATABASE_TRANSACTION_ERROR]: '数据库事务失败',
    
    // 缓存错误
    [ERROR_CODES.CACHE_ERROR]: '缓存操作失败',
    [ERROR_CODES.CACHE_CONNECTION_ERROR]: '缓存连接失败',
    [ERROR_CODES.CACHE_SET_ERROR]: '缓存设置失败',
    [ERROR_CODES.CACHE_GET_ERROR]: '缓存获取失败',
    
    // 网络错误
    [ERROR_CODES.NETWORK_ERROR]: '网络错误',
    [ERROR_CODES.REQUEST_TIMEOUT]: '请求超时',
    [ERROR_CODES.CONNECTION_REFUSED]: '连接被拒绝',
    
    // 服务器错误
    [ERROR_CODES.SERVER_ERROR]: '服务器内部错误',
    [ERROR_CODES.SERVICE_UNAVAILABLE]: '服务暂时不可用',
    [ERROR_CODES.MAINTENANCE_MODE]: '系统维护中',
    
    // 配置错误
    [ERROR_CODES.CONFIG_ERROR]: '配置错误',
    [ERROR_CODES.INVALID_CONFIG]: '配置格式无效',
    [ERROR_CODES.MISSING_CONFIG]: '缺少必需配置'
};

/**
 * HTTP 状态码映射
 * 将内部错误码映射到合适的 HTTP 状态码
 */
export const HTTP_STATUS_MAP = {
    [ERROR_CODES.SUCCESS]: 200,
    [ERROR_CODES.GENERAL_ERROR]: 400,
    
    // 接口相关错误
    [ERROR_CODES.API_NOT_FOUND]: 404,
    [ERROR_CODES.API_METHOD_NOT_ALLOWED]: 405,
    [ERROR_CODES.API_INTERNAL_ERROR]: 500,
    [ERROR_CODES.API_TIMEOUT]: 408,
    [ERROR_CODES.API_RATE_LIMITED]: 429,
    
    // 参数验证错误
    [ERROR_CODES.INVALID_PARAMS]: 400,
    [ERROR_CODES.MISSING_REQUIRED_PARAMS]: 400,
    [ERROR_CODES.INVALID_PARAM_TYPE]: 400,
    [ERROR_CODES.PARAM_OUT_OF_RANGE]: 400,
    [ERROR_CODES.INVALID_PARAM_FORMAT]: 400,
    
    // 认证授权错误
    [ERROR_CODES.UNAUTHORIZED]: 401,
    [ERROR_CODES.TOKEN_EXPIRED]: 401,
    [ERROR_CODES.TOKEN_INVALID]: 401,
    [ERROR_CODES.PERMISSION_DENIED]: 403,
    [ERROR_CODES.LOGIN_REQUIRED]: 401,
    
    // 文件操作错误
    [ERROR_CODES.FILE_NOT_FOUND]: 404,
    [ERROR_CODES.FILE_READ_ERROR]: 500,
    [ERROR_CODES.FILE_WRITE_ERROR]: 500,
    [ERROR_CODES.FILE_UPLOAD_ERROR]: 400,
    [ERROR_CODES.FILE_SIZE_EXCEEDED]: 413,
    [ERROR_CODES.FILE_TYPE_NOT_ALLOWED]: 415,
    
    // 数据库错误
    [ERROR_CODES.DATABASE_ERROR]: 500,
    [ERROR_CODES.DATABASE_CONNECTION_ERROR]: 500,
    [ERROR_CODES.DATABASE_QUERY_ERROR]: 500,
    [ERROR_CODES.DATABASE_TRANSACTION_ERROR]: 500,
    
    // 缓存错误
    [ERROR_CODES.CACHE_ERROR]: 500,
    [ERROR_CODES.CACHE_CONNECTION_ERROR]: 500,
    [ERROR_CODES.CACHE_SET_ERROR]: 500,
    [ERROR_CODES.CACHE_GET_ERROR]: 500,
    
    // 网络错误
    [ERROR_CODES.NETWORK_ERROR]: 502,
    [ERROR_CODES.REQUEST_TIMEOUT]: 408,
    [ERROR_CODES.CONNECTION_REFUSED]: 502,
    
    // 服务器错误
    [ERROR_CODES.SERVER_ERROR]: 500,
    [ERROR_CODES.SERVICE_UNAVAILABLE]: 503,
    [ERROR_CODES.MAINTENANCE_MODE]: 503,
    
    // 配置错误
    [ERROR_CODES.CONFIG_ERROR]: 500,
    [ERROR_CODES.INVALID_CONFIG]: 500,
    [ERROR_CODES.MISSING_CONFIG]: 500
};

/**
 * 创建标准化错误对象
 * @param {number} code - 错误码
 * @param {string} [message] - 自定义错误信息，如果不提供则使用默认信息
 * @param {any} [data] - 附加数据
 * @param {number} [httpStatus] - 自定义 HTTP 状态码
 * @returns {Object} 错误对象
 */
export function createError(code, message, data = null, httpStatus = null) {
    const defaultMessage = ERROR_MESSAGES[code] || '未知错误';
    const defaultHttpStatus = HTTP_STATUS_MAP[code] || 500;
    
    return {
        code,
        message: message || defaultMessage,
        data,
        httpStatus: httpStatus || defaultHttpStatus,
        timestamp: new Date().toISOString()
    };
}

/**
 * 创建成功响应对象
 * @param {any} data - 响应数据
 * @param {string} [message] - 自定义成功信息
 * @returns {Object} 成功响应对象
 */
export function createSuccess(data = null, message = null) {
    return {
        code: ERROR_CODES.SUCCESS,
        message: message || ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data,
        timestamp: new Date().toISOString()
    };
}

/**
 * 检查是否为成功状态
 * @param {number} code - 错误码
 * @returns {boolean} 是否成功
 */
export function isSuccess(code) {
    return code === ERROR_CODES.SUCCESS;
}

/**
 * 检查是否为内部系统错误
 * @param {number} code - 错误码
 * @returns {boolean} 是否为内部错误
 */
export function isInternalError(code) {
    return code >= 10 && code <= 99;
}

/**
 * 检查是否为用户自定义错误
 * @param {number} code - 错误码
 * @returns {boolean} 是否为用户自定义错误
 */
export function isUserDefinedError(code) {
    return code >= ERROR_CODES.USER_DEFINED_START;
}

/**
 * 注册用户自定义错误码
 * @param {number} code - 错误码 (必须 >= 100)
 * @param {string} message - 错误信息
 * @param {number} [httpStatus=400] - HTTP 状态码
 */
export function registerUserError(code, message, httpStatus = 400) {
    if (code < ERROR_CODES.USER_DEFINED_START) {
        throw new Error(`用户自定义错误码必须大于等于 ${ERROR_CODES.USER_DEFINED_START}`);
    }
    
    if (ERROR_MESSAGES[code]) {
        console.warn(`错误码 ${code} 已存在，将被覆盖`);
    }
    
    ERROR_MESSAGES[code] = message;
    HTTP_STATUS_MAP[code] = httpStatus;
}

/**
 * 获取错误信息
 * @param {number} code - 错误码
 * @returns {string} 错误信息
 */
export function getErrorMessage(code) {
    return ERROR_MESSAGES[code] || '未知错误';
}

/**
 * 获取 HTTP 状态码
 * @param {number} code - 错误码
 * @returns {number} HTTP 状态码
 */
export function getHttpStatus(code) {
    return HTTP_STATUS_MAP[code] || 500;
}

// 导出常用错误码以便快速使用
export const {
    SUCCESS,
    GENERAL_ERROR,
    API_NOT_FOUND,
    INVALID_PARAMS,
    UNAUTHORIZED,
    FILE_NOT_FOUND,
    SERVER_ERROR
} = ERROR_CODES;
