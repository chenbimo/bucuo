# BunPI - 泵派

BunPI - 为 Bun 专属打造的 API 接口框架核心引擎

## 特性

-   🏗️ 基于 Bunpi Core 框架构建
-   👥 用户管理系统
-   🔐 JWT 认证
-   📊 请求统计
-   📁 文件上传下载
-   💾 缓存支持
-   🔧 环境配置管理

## 快速开始

### 安装依赖

```bash
cd api
bun install
```

### 启动开发服务器

```bash
bun run dev
```

### 启动生产服务器

```bash
bun run start
```

## 环境配置

项目支持通过环境变量配置：

### 开发环境 (.env.development)

```
PORT=3000
HOST=localhost
JWT_SECRET=bunpi-dev-secret-key-2024
JWT_EXPIRES_IN=24h
REDIS_USE_MEMORY_CACHE=true
CORS_ORIGIN=*
LOG_LEVEL=debug
```

### 生产环境 (.env.production)

```
PORT=8080
HOST=0.0.0.0
JWT_SECRET=your-production-secret-key-here
JWT_EXPIRES_IN=7d
REDIS_USE_MEMORY_CACHE=false
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

## 扩展开发

### 添加新的 API

在 `apis/` 目录下创建新的 API 文件：

```javascript
// apis/my-api.js
export default function myApi(app) {
    app.get('/api/my-endpoint', async (context) => {
        return { message: 'My API endpoint' };
    });
}
```

### 添加新的插件

在 `plugins/` 目录下创建新的插件文件：

```javascript
// plugins/my-plugin.js
export default {
    name: 'my-plugin',
    order: 10,
    async handler(context) {
        // 插件逻辑
    }
};
```
