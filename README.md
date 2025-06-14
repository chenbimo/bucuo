# Bunfly API

基于 Bunfly Core 构建的业务层 API 项目。

## 特性

-   🏗️ 基于 Bunfly Core 框架构建
-   👥 用户管理系统
-   🔐 JWT 认证
-   📊 请求统计
-   📁 文件上传下载
-   💾 缓存支持
-   🔧 环境配置管理

## 项目结构

```
api/
├── main.js              # 业务入口文件
├── server.js            # 服务器启动脚本
├── test.js              # 测试文件
├── apis/                # 业务接口目录
│   ├── user.js          # 用户管理接口
│   └── stats.js         # 统计信息接口
├── plugins/             # 业务插件目录
│   └── stats.js         # 请求统计插件
├── .env.development     # 开发环境配置
├── .env.production      # 生产环境配置
├── package.json         # 项目配置
└── README.md           # 说明文档
```

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

### 运行测试

```bash
bun run test
```

## API 接口

### 首页

-   `GET /` - API 欢迎页面
-   `GET /api/docs` - API 文档

### 用户管理

-   `GET /api/users` - 获取用户列表
-   `GET /api/users/:id` - 获取用户详情
-   `POST /api/users` - 创建用户
-   `PUT /api/users/:id` - 更新用户
-   `DELETE /api/users/:id` - 删除用户

### 认证

-   `POST /api/auth/login` - 用户登录
-   `GET /api/auth/me` - 获取当前用户信息
-   `GET /api/users/profile` - 受保护的路由示例

### 统计信息

-   `GET /api/stats/requests` - 请求统计
-   `GET /api/stats/methods` - HTTP 方法统计
-   `GET /api/stats/system` - 系统统计

### 文件操作

-   `POST /upload` - 上传文件
-   `POST /upload/multiple` - 批量上传文件
-   `GET /files` - 文件列表
-   `GET /files/:filename` - 文件信息
-   `GET /download/:filename` - 下载文件
-   `DELETE /files/:filename` - 删除文件

### 系统

-   `GET /health` - 健康检查
-   `GET /status` - 系统状态
-   `GET /info` - 系统信息

## 使用示例

### 用户登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 创建用户

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "name": "New User",
    "bio": "A new user"
  }'
```

### 上传文件

```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@example.txt"
```

### 获取统计信息

```bash
curl http://localhost:3000/api/stats/requests
```

## 环境配置

项目支持通过环境变量配置：

### 开发环境 (.env.development)

```
PORT=3000
HOST=localhost
JWT_SECRET=bunfly-dev-secret-key-2024
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

## 许可证

MIT License
