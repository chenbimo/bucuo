import { serve } from 'bun';
import path from 'path';
import { Code } from './config/code.js';
import { Env } from './config/env.js';
import { Validate } from './libs/validate.js';

export { Code } from './config/code.js';

class Bunpi {
    constructor(options = {}) {
        this.apiRoutes = new Map();
        this.pluginLists = [];
        this.pluginContext = {};
    }

    async loadPlugins() {
        try {
            const glob = new Bun.Glob('[a-z][A-Z0-9].js');
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
                    this.pluginContext[plugin.pluginName] = typeof plugin?.onInit === 'function' ? await plugin?.onInit(this.pluginContext) : {};
                    this.pluginLists.push(plugin);
                    console.log(`✅ 插件 ${plugin.pluginName} - ${plugin.order} 初始化完成`);
                } catch (error) {
                    console.warn(`插件 ${plugin.pluginName} 初始化失败:`, error.message);
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
                apiInstance.route = '/api/core/' + path.relative(coreApisDir, file).replace(/\.js$/, '').replace(/\\/g, '/');
                this.apiRoutes.set(apiInstance.route, apiInstance);
            }
        } catch (error) {
            console.error('加载 API 时发生错误:', error);
        }
    }

    /**
     * 启动服务器
     */
    async listen(callback) {
        await this.loadPlugins();
        await this.loadApis();

        const server = serve({
            port: Env.APP_PORT,
            hostname: Env.APP_HOST,
            // fetch: async (req) => {
            //     const path = new URL(req.url).pathname;
            // },
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
                        const apiPath = url.pathname;
                        const body = await req.json();
                        console.log('🔥[ body ]-104', body);
                        console.log('🔥[ req.method ]-107', req.method);
                        const api = this.apiRoutes.get(apiPath);
                        if (!api) {
                            return Response.json(Code.API_NOT_FOUND);
                        }
                        // 执行插件的请求处理钩子
                        for await (const plugin of this.pluginLists) {
                            try {
                                if (typeof plugin?.onGet === 'function') {
                                    await plugin?.onGet(this.pluginContext, req);
                                }
                            } catch (error) {
                                console.error('插件处理请求时发生错误:', error);
                            }
                        }
                        console.log('🔥[ api ]-115', api);
                        console.log('🔥[ req ]-117', req.body);

                        const validate = Validate(req.body, api.schema.fields, api.schema.required);
                        console.log('🔥[ validate ]-115', validate);
                        const result = await api.handler(this.pluginContext, req);
                        if (result && typeof result === 'object' && 'code' in result) {
                            return Response.json(result);
                        } else {
                            return new Response(result);
                        }
                    } catch (err) {
                        console.log('🔥[ err ]-133', err);
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

export { Bunpi };
