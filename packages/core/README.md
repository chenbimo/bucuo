# BunPI - 泵派

BunPI - 为 Bun 专属打造的 API 接口框架核心引擎

## 特性

-   🚀 基于 Bun 运行时，性能卓越
-   📦 零依赖设计，轻量级框架
-   🔌 插件系统，支持自定义执行顺序
-   🔒 内置 JWT 认证支持
-   📁 内置文件上传功能
-   🌐 CORS 跨域支持
-   📝 结构化日志系统
-   💾 Redis 缓存支持 (可回退到内存缓存)
-   🛣️ 简洁的路由系统
-   ⚡ ESM 模块支持

## 项目结构

```
core/
├── main.js              # 核心入口文件
├── util.js              # 工具函数文件
├── apis/                # 内置接口目录
│   ├── health.js        # 健康检查接口
│   └── file.js          # 文件操作接口
├── plugins/             # 内置插件目录
│   ├── cors.js          # CORS 跨域插件
│   ├── logger.js        # 日志插件
│   ├── jwt.js           # JWT 插件
│   ├── upload.js        # 文件上传插件
│   └── redis.js         # Redis 插件
├── libs/                # 自实现的第三方功能
│   └── index.js         # 库入口
├── package.json         # 项目配置
└── README.md           # 说明文档
```

## 基本用法

```javascript
import Bunpi from './main.js';

const app = new Bunpi({
    port: 3000,
    host: 'localhost'
});

// 添加路由
app.get('/hello', async (context) => {
    return { message: 'Hello from Bunpi Core!' };
});

// 启动服务器
await app.listen();
```

## 插件系统

内置插件按以下顺序执行：

1. **Redis 插件** (order: -1) - 缓存支持
2. **CORS 插件** (order: 1) - 跨域处理
3. **Logger 插件** (order: 0) - 日志记录
4. **JWT 插件** (order: 2) - 认证支持
5. **Upload 插件** (order: 3) - 文件上传

### 创建自定义插件

```javascript
const myPlugin = {
    name: 'my-plugin',
    order: 5,
    async handler(context) {
        // 插件逻辑
        console.log('Processing:', context.request.url);
    }
};

app.use(myPlugin);
```

## API 接口

### 健康检查

-   `GET /health` - 基础健康检查
-   `GET /status` - 详细状态信息
-   `GET /info` - 系统信息

### 文件操作

-   `POST /upload` - 文件上传
-   `GET /files` - 文件列表
-   `GET /files/:filename` - 文件信息
-   `GET /download/:filename` - 文件下载
-   `DELETE /files/:filename` - 删除文件

## 配置

通过构造函数配置或 `setConfig` 方法：

```javascript
const app = new Bunpi({
    port: 3000,
    host: 'localhost'
});

// 或者
app.setConfig('cors.origin', '*');
app.setConfig('upload.maxSize', 10 * 1024 * 1024);
```

## 许可证

MIT License
