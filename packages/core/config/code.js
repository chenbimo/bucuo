/**
 * 错误码管理
 * 统一管理系统中的所有错误码和错误信息
 *
 * 错误码规范：
 * - 0: 成功
 * - 1: 失败
 * - 10-99: 内部系统错误
 * - 100+: 用户自定义错误
 */

/**
 * 错误码常量定义
 */
export const Code = {
    // 成功状态
    SUCCESS: {
        code: 0,
        msg: '操作成功'
    },

    // 通用错误
    FAIL: {
        code: 1,
        msg: '操作失败'
    },

    // 内部系统错误 (10-99)
    // 接口相关错误 (10-19)
    API_NOT_FOUND: {
        code: 10,
        msg: '接口不存在'
    },
    API_METHOD_NOT_ALLOWED: {
        code: 11,
        msg: '请求方法不被允许'
    },
    API_INTERNAL_ERROR: {
        code: 12,
        msg: '接口内部错误'
    },
    API_TIMEOUT: {
        code: 13,
        msg: '接口请求超时'
    },
    API_RATE_LIMITED: {
        code: 14,
        msg: '请求频率超限'
    },

    // 参数验证错误 (20-29)
    INVALID_PARAMS: {
        code: 20,
        msg: '参数验证失败'
    },
    MISSING_REQUIRED_PARAMS: {
        code: 21,
        msg: '缺少必需参数'
    },
    INVALID_PARAM_TYPE: {
        code: 22,
        msg: '参数类型错误'
    },
    PARAM_OUT_OF_RANGE: {
        code: 23,
        msg: '参数值超出范围'
    },
    INVALID_PARAM_FORMAT: {
        code: 24,
        msg: '参数格式错误'
    },

    // 认证授权错误 (30-39)
    UNAUTHORIZED: {
        code: 30,
        msg: '未授权访问'
    },
    TOKEN_EXPIRED: {
        code: 31,
        msg: '令牌已过期'
    },
    TOKEN_INVALID: {
        code: 32,
        msg: '令牌无效'
    },
    PERMISSION_DENIED: {
        code: 33,
        msg: '权限不足'
    },
    LOGIN_REQUIRED: {
        code: 34,
        msg: '需要登录'
    },

    // 文件操作错误 (40-49)
    FILE_NOT_FOUND: {
        code: 40,
        msg: '文件不存在'
    },
    FILE_READ_ERROR: {
        code: 41,
        msg: '文件读取失败'
    },
    FILE_WRITE_ERROR: {
        code: 42,
        msg: '文件写入失败'
    },
    FILE_UPLOAD_ERROR: {
        code: 43,
        msg: '文件上传失败'
    },
    FILE_SIZE_EXCEEDED: {
        code: 44,
        msg: '文件大小超出限制'
    },
    FILE_TYPE_NOT_ALLOWED: {
        code: 45,
        msg: '文件类型不被允许'
    },

    // 数据库错误 (50-59)
    DATABASE_ERROR: {
        code: 50,
        msg: '数据库操作失败'
    },
    DATABASE_CONNECTION_ERROR: {
        code: 51,
        msg: '数据库连接失败'
    },
    DATABASE_QUERY_ERROR: {
        code: 52,
        msg: '数据库查询失败'
    },
    DATABASE_TRANSACTION_ERROR: {
        code: 53,
        msg: '数据库事务失败'
    },

    // 缓存错误 (60-69)
    CACHE_ERROR: {
        code: 60,
        msg: '缓存操作失败'
    },
    CACHE_CONNECTION_ERROR: {
        code: 61,
        msg: '缓存连接失败'
    },
    CACHE_SET_ERROR: {
        code: 62,
        msg: '缓存设置失败'
    },
    CACHE_GET_ERROR: {
        code: 63,
        msg: '缓存获取失败'
    },

    // 网络错误 (70-79)
    NETWORK_ERROR: {
        code: 70,
        msg: '网络错误'
    },
    REQUEST_TIMEOUT: {
        code: 71,
        msg: '请求超时'
    },
    CONNECTION_REFUSED: {
        code: 72,
        msg: '连接被拒绝'
    },

    // 服务器错误 (80-89)
    SERVER_ERROR: {
        code: 80,
        msg: '服务器内部错误'
    },
    SERVICE_UNAVAILABLE: {
        code: 81,
        msg: '服务暂时不可用'
    },
    MAINTENANCE_MODE: {
        code: 82,
        msg: '系统维护中'
    },

    // 配置错误 (90-99)
    CONFIG_ERROR: {
        code: 90,
        msg: '配置错误'
    },
    INVALID_CONFIG: {
        code: 91,
        msg: '配置格式无效'
    },
    MISSING_CONFIG: {
        code: 92,
        msg: '缺少必需配置'
    },

    // 用户自定义错误起始点 (100+)
    USER_DEFINED_START: {
        code: 100,
        msg: '用户自定义错误起始点'
    }
};
