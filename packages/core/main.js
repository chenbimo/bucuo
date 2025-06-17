import { serve } from 'bun';
import path from 'node:path';
import { Code } from './config/code.js';
import { Env } from './config/env.js';
import { Validator } from './libs/validate.js';

// 工具函数
import { isType } from './utils/isType.js';
import { colors } from './utils/colors.js';
import { logger } from './utils/logger.js';

class Bunpi {
    constructor(options = {}) {
        this.apiRoutes = new Map();
        this.pluginLists = [];
        this.appContext = {};
        this.validator = new Validator(); // 创建验证器实例
    }

    async initCheck() {
        try {
            const checksDir = path.join(import.meta.dir, 'checks');
            const glob = new Bun.Glob('*.js');

            // 统计信息
            let totalChecks = 0;
            let passedChecks = 0;
            let failedChecks = 0;

            // 扫描并执行检查函数
            for await (const file of glob.scan({
                cwd: checksDir,
                onlyFiles: true,
                absolute: true
            })) {
                const fileName = path.basename(file);
                if (fileName.startsWith('_')) continue; // 跳过以下划线开头的文件

                try {
                    totalChecks++;

                    // 导入检查模块
                    const check = await import(file);

                    // 执行默认导出的函数
                    if (typeof check.default === 'function') {
                        const checkResult = await check.default(this.appContext);
                        if (checkResult === true) {
                            passedChecks++;
                        } else {
                            console.log(`${colors.error} 检查未通过: ${fileName}`);
                            failedChecks++;
                        }
                    } else {
                        console.log(`${colors.warn} 文件 ${fileName} 未导出默认函数`);
                        failedChecks++;
                    }
                } catch (error) {
                    console.log(`${colors.error} 检查失败 ${fileName}: ${error.message}`);
                    failedChecks++;
                }
            }

            // 输出检查结果统计
            console.log(`${colors.info} 总检查数: ${colors.blue(totalChecks)}, 通过: ${colors.green(passedChecks)}, 失败: ${colors.red(failedChecks)}`);

            if (failedChecks > 0) {
                process.exit();
            } else if (totalChecks > 0) {
                console.log(`${colors.success} 所有系统检查通过!`);
            } else {
                console.log(`${colors.info} 未执行任何检查`);
            }
        } catch (error) {
            console.log(`${colors.error} 执行系统检查过程中出错:`, error);
            process.exit();
        }
    }

    async loadPlugins() {
        try {
            const glob = new Bun.Glob('*.js');
            const corePlugins = [];

            // 扫描指定目录
            for await (const file of glob.scan({
                cwd: path.join(import.meta.dir, 'plugins'),
                onlyFiles: true,
                absolute: true
            })) {
                const fileName = path.basename(file, '.js');
                if (fileName.startsWith('_')) continue;
                const plugin = await import(file);
                const pluginInstance = plugin.default;
                pluginInstance.pluginName = fileName;
                corePlugins.push(pluginInstance);
            }

            // 按 order 排序
            corePlugins.sort((a, b) => (a.order || 0) - (b.order || 0));

            for (const plugin of corePlugins) {
                try {
                    this.pluginLists.push(plugin);
                    this.appContext[plugin.pluginName] = typeof plugin?.onInit === 'function' ? await plugin?.onInit(this.appContext) : {};

                    console.log(`${colors.success} 插件 ${plugin.pluginName} - ${plugin.order} 初始化完成`);
                } catch (error) {
                    console.warn(`${colors.error} 插件 ${plugin.pluginName} 初始化失败:`, error.message);
                }
            }
        } catch (error) {
            console.log('🔥[ error ]-83', error);
        }
    }

    async loadApis() {
        try {
            const glob = new Bun.Glob('**/*.js');
            const coreApisDir = path.join(import.meta.dir, 'apis');

            // 扫描指定目录
            for await (const file of glob.scan({
                cwd: coreApisDir,
                onlyFiles: true,
                absolute: true
            })) {
                const fileName = path.basename(file, '.js');
                if (fileName.startsWith('_')) continue;
                const api = await import(file);
                const apiInstance = api.default;
                const apiPath = path.relative(coreApisDir, file).replace(/\.js$/, '').replace(/\\/g, '/');
                apiInstance.route = `${apiInstance.method.toUpperCase()}/api/core/${apiPath}`;
                this.apiRoutes.set(apiInstance.route, apiInstance);
            }
        } catch (error) {
            console.error(`${colors.error} 加载 API 时发生错误:`, error);
        }
    }

    /**
     * 启动服务器
     */
    async listen(callback) {
        logger.info('BunPI API 服务正在启动...');
        await this.initCheck();
        await this.loadPlugins();
        await this.loadApis();

        const server = serve({
            port: Env.APP_PORT,
            hostname: Env.APP_HOST,
            routes: {
                '/': async (req) => {
                    return Response.json({
                        ...Code.SUCCESS,
                        msg: 'BunPI API 服务已启动',
                        data: {
                            mode: Env.NODE_ENV,
                            host: Env.APP_HOST,
                            port: Env.APP_PORT
                        }
                    });
                },
                '/api/*': async (req) => {
                    try {
                        const url = new URL(req.url);
                        const apiPath = `${req.method}${url.pathname}`;

                        const api = this.apiRoutes.get(apiPath);
                        if (!api) return Response.json(Code.API_NOT_FOUND);

                        if (req.method === 'GET') {
                            this.appContext.body = Object.fromEntries(url.searchParams);
                        }
                        if (req.method === 'POST') {
                            try {
                                this.appContext.body = await req.json();
                            } catch (err) {
                                return Response.json(Code.INVALID_PARAM_FORMAT);
                            }
                        }
                        console.log('🔥[ this.pluginLists ]-185', this.pluginLists);

                        // 执行插件的请求处理钩子
                        for await (const plugin of this.pluginLists) {
                            try {
                                if (typeof plugin?.onGet === 'function') {
                                    await plugin?.onGet(this.appContext, req);
                                }
                            } catch (error) {
                                console.error(`${colors.error} 插件处理请求时发生错误:`, error);
                            }
                        }
                        logger.debug({ 请求路径: apiPath, 请求方法: req.method, 用户信息: this.appContext?.user, 请求体: this.appContext?.body });

                        // 使用新的验证器实例进行验证
                        const validate = this.validator.validate(this.appContext.body, api.schema.fields, api.schema.required);
                        if (validate.code !== 0) {
                            return Response.json({
                                ...Code.API_PARAMS_ERROR,
                                data: validate.fields
                            });
                        }
                        const result = await api.handler(this.appContext, req);
                        if (result && typeof result === 'object' && 'code' in result) {
                            return Response.json(result);
                        } else {
                            return new Response(result);
                        }
                    } catch (err) {
                        console.log(`${colors.error} [ err ]-133`, err);
                        return Response.json(Code.INTERNAL_SERVER_ERROR);
                    }
                },
                '/*': async (req) => {
                    const url = new URL(req.url);
                    const filePath = path.join(process.cwd(), 'public', url.pathname);

                    try {
                        const file = await Bun.file(filePath);
                        if (await file.exists()) {
                            return new Response(file, {
                                headers: {
                                    'Content-Type': file.type || 'application/octet-stream'
                                }
                            });
                        } else {
                            return Response.json(Code.FILE_NOT_FOUND);
                        }
                    } catch (error) {
                        return Response.json(Code.INTERNAL_SERVER_ERROR);
                    }
                }
            },
            error(error) {
                console.error(error);
                return Response.json(Code.INTERNAL_SERVER_ERROR);
            }
        });

        if (callback && typeof callback === 'function') {
            callback(server);
        }
    }
}

export { Bunpi, Code, Env, Validator, colors, logger };
