创建一个为/oven-sh/bun 量身打造的通用 js 后端 api 框架，需要满足以下需求。

1. 这个文件不要有任何改动，只能由用户自己手动改动。
2. 框架的项目目录为 bunfly，使用 JavaScript + ESM 语法。
3. bunfly 根目录下除了 PROJECT.md 文件，api 目录和 core 目录外，不能有其他文件。
4. 尽快使用 Bun 的原生 api，减少使用 nodejs 的 api。
5. 所有测试文件放到 bunfly/tests 目录下，并且使用 Bun 来进行测试，不要用 nodejs。
6. 所有注释，提示都用中文。
7. 所有的接口文件都要被 createGetAPI 或 createPostAPI 包裹。
8. 其中 bunfly/core 是核心驱动，提供了通用的 api 接口框架的功能。

    1. bunfly/core/apis 是所有内置的接口所在目录。
    2. bunfly/core/libs 是诸如 redis 操作库，jwt 实现，文件上传实现等通用实现的库目录。
    3. bunfly/core/plugins 是所有内置的插件所在目录。
        1. bunfly/core/plugins/redis.js 是内置 redis 插件。
        2. bunfly/core/plugins/logger.js 是内置 logger 日志插件。
        3. bunfly/core/plugins/cors.js 是内置 cors 跨域插件。
        4. bunfly/core/plugins/jwt.js 是内置 jwt 插件。
        5. bunfly/core/plugins/upload.js 是内置 upload 文件上传插件。
    4. bunfly/core/main.js 是入口文件。

9. 其中 bunfly/api 是业务目录，在 bunfly/core 的基础上，提供对外业务功能。
    1. bunlfy/api/apis 是业务接口目录。
    2. bunfly/api/plugins 是业务插件目录。
    3. bunfly/api/main.js 是业务入口文件。
    4. bunfly/api/.env.development 是开发环境变量。
    5. bunfly/api/.env.production 是发布环境变量。
