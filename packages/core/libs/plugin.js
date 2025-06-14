/**
 * 插件创建工具
 * 提供统一的插件创建和管理机制
 */

/**
 * 创建标准化的插件
 * @param {Object} config - 插件配置
 * @param {string} config.name - 插件名称
 * @param {number} [config.order=0] - 插件执行顺序
 * @param {Function} [config.onInit] - 初始化函数，在服务器启动时执行一次
 * @param {Function} [config.onRequest] - 请求处理函数，在每个请求时执行
 * @param {boolean} [config.enabled=true] - 是否启用插件
 * @returns {Object} 标准化的插件对象
 */
export function createPlugin(config) {
    if (!config.name) {
        throw new Error('插件必须有名称');
    }

    const plugin = {
        name: config.name,
        order: config.order || 0,
        enabled: config.enabled !== false,
        _initialized: false,
        _initData: null,

        async handler(context) {
            // 如果插件被禁用，直接返回
            if (!this.enabled) {
                return;
            }

            // 初始化阶段（没有 request 时）
            if (!context.request && !this._initialized) {
                console.log(`🔧 正在初始化插件: ${this.name}`);

                try {
                    if (config.onInit && typeof config.onInit === 'function') {
                        this._initData = await config.onInit(context);
                    }
                    this._initialized = true;
                    console.log(`✅ 插件 ${this.name} 初始化完成`);
                } catch (error) {
                    console.error(`❌ 插件 ${this.name} 初始化失败:`, error.message);
                    throw error;
                }
                return;
            }

            // 请求处理阶段（有 request 时）
            if (this._initialized && context.request) {
                try {
                    if (config.onRequest && typeof config.onRequest === 'function') {
                        return await config.onRequest(context, this._initData);
                    }
                } catch (error) {
                    console.error(`❌ 插件 ${this.name} 请求处理失败:`, error.message);
                    throw error;
                }
            }
        }
    };

    return plugin;
}

/**
 * 创建简单插件（只有请求处理逻辑，无需初始化）
 * @param {Object} config - 插件配置
 * @param {string} config.name - 插件名称
 * @param {number} [config.order=0] - 插件执行顺序
 * @param {Function} config.handler - 请求处理函数
 * @returns {Object} 插件对象
 */
export function createSimplePlugin(config) {
    return createPlugin({
        name: config.name,
        order: config.order,
        onRequest: config.handler
    });
}
