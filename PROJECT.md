创建一个为/oven-sh/bun 量身打造的通用 js 后端 api 框架，需要满足以下需求。

1. PROJECT.md 文件文件不要有任何改动，只能由用户自己手动改动。
2. 框架使用 JavaScript + ESM 语法。
3. 尽快使用 Bun 的原生 api，减少使用 nodejs 的 api。
4. 所有测试文件放到 packages/tests 目录下，并且使用 Bun 来进行测试，不要用 nodejs。
5. 所有注释，提示都用中文。
6. 所有的接口文件都要被 createGetAPI 或 createPostAPI 包裹。
7. 其中 packages/core 是核心驱动，提供了通用的 api 接口框架的功能。

    1. packages/core/apis 是所有内置的接口所在目录。
    2. packages/core/libs 是诸如 redis 操作库，jwt 实现，文件上传实现等通用实现的库目录。
    3. packages/core/plugins 是所有内置的插件所在目录。
        1. packages/core/plugins/redis.js 是内置 redis 插件。
        2. packages/core/plugins/logger.js 是内置 logger 日志插件。
        3. packages/core/plugins/cors.js 是内置 cors 跨域插件。
        4. packages/core/plugins/jwt.js 是内置 jwt 插件。
        5. packages/core/plugins/upload.js 是内置 upload 文件上传插件。
    4. packages/core/main.js 是入口文件。

8. 其中 packages/api 是业务目录，在 packages/core 的基础上，提供对外业务功能。
    1. bunlfy/api/apis 是业务接口目录。
    2. packages/api/plugins 是业务插件目录。
    3. packages/api/main.js 是业务入口文件。
    4. packages/api/.env.development 是开发环境变量。
    5. packages/api/.env.production 是发布环境变量。
