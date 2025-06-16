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
 * @param {Function} [config.onResponse] - 响应处理函数，在每次返回数据之前执行
 * @param {boolean} [config.enabled=true] - 是否启用插件
 * @returns {Object} 标准化的插件对象
 */
export const Plugin = (config) => {
    const plugin = {
        name: config.name,
        order: config.order || 0,
        enabled: config.enabled !== false,
        _initialized: false,

        // 初始化钩子
        async handleInit(context) {
            if (!this.enabled || this._initialized) {
                return;
            }

            console.log(`🔧 正在初始化插件: ${this.name}`);

            try {
                if (config.onInit && typeof config.onInit === 'function') {
                    await config.onInit(context);
                }
                this._initialized = true;
                console.log(`✅ 插件 ${this.name} 初始化完成`);
            } catch (error) {
                console.error(`❌ 插件 ${this.name} 初始化失败:`, error.message);
                throw error;
            }
        },

        // 请求处理钩子
        async handleRequest(context) {
            if (!this.enabled || !this._initialized) {
                return;
            }

            try {
                if (config.onRequest && typeof config.onRequest === 'function') {
                    return await config.onRequest(context);
                }
            } catch (error) {
                console.error(`❌ 插件 ${this.name} 请求处理失败:`, error.message);
                throw error;
            }
        },

        // 响应处理钩子
        async handleResponse(context) {
            if (!this.enabled || !this._initialized) {
                return;
            }

            try {
                if (config.onResponse && typeof config.onResponse === 'function') {
                    return await config.onResponse(context);
                }
            } catch (error) {
                console.error(`❌ 插件 ${this.name} 响应处理失败:`, error.message);
                throw error;
            }
        }
    };

    return plugin;
};
