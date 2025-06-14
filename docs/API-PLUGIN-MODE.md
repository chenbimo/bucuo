# 插件化 API 封装模式

## 概述

我们已经将 Bunfly 的 API 定义方式重构为更统一的插件化封装模式。新的模式使用单一的 `createApi` 函数，通过配置对象来定义 API 的各个方面。

## 新的 API 定义语法

### 基本语法

```javascript
import { createApi } from 'bunfly';

export default createApi({
    name: '接口名称', // 必填：接口的描述性名称
    schema: validationRules, // 可选：参数验证规则对象
    method: 'post', // 可选：HTTP 方法，'get' 或 'post'，默认为 'post'
    handler: async (data, context) => {
        // 接口处理逻辑
        return response;
    }
});
```

### 字段说明

1. **name** (必填, string)

    - 接口的描述性名称
    - 用于错误消息和调试信息
    - 示例：`'用户登录'`、`'文件上传'`、`'系统状态'`

2. **schema** (可选, object)

    - 参数验证规则对象
    - 使用我们的简单验证器规则格式
    - 如果不提供，则不进行参数验证

3. **method** (可选, string)

    - HTTP 方法：`'get'` 或 `'post'`
    - 默认值：`'post'`

4. **handler** (必填, function)
    - 接口的处理函数
    - 签名：`async (data, context) => response`
    - `data`: 验证后的参数数据
    - `context`: 请求上下文对象

## 示例

### 1. POST 接口（有参数验证）

```javascript
import { createApi, createRes } from 'bunfly';
import { user } from '../schema/index.js';

export default createApi({
    name: '用户登录',
    schema: user.login,
    method: 'post',
    handler: async (data, context) => {
        const { username, password } = data;

        if (username === 'admin' && password === 'password') {
            return createRes(200, '登录成功', {
                user: { id: 1, username: 'admin' },
                token: 'jwt-token'
            });
        }

        return createRes(401, '用户名或密码错误');
    }
});
```

### 2. GET 接口（有参数验证）

```javascript
import { createApi, createRes } from 'bunfly';
import { user } from '../schema/index.js';

export default createApi({
    name: '用户详情',
    schema: user.detail,
    method: 'get',
    handler: async (data, context) => {
        const { id } = data;

        const userData = {
            id,
            username: \`user\${id}\`,
            email: \`user\${id}@example.com\`
        };

        return createRes(200, '获取成功', userData);
    }
});
```

### 3. GET 接口（无参数）

```javascript
import { createApi, createRes } from 'bunfly';

export default createApi({
    name: '健康检查',
    method: 'get',
    handler: async (data, context) => {
        return createRes(200, '服务正常', {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    }
});
```

### 4. 分页查询接口

```javascript
import { createApi, createRes } from 'bunfly';
import { user } from '../schema/index.js';

export default createApi({
    name: '用户列表',
    schema: user.query,
    method: 'get',
    handler: async (data, context) => {
        const { page = 1, limit = 10, keyword } = data;

        // 模拟分页查询
        const users = generateUserList(page, limit, keyword);

        return createRes(200, '获取成功', {
            users,
            pagination: {
                page,
                limit,
                total: 100
            }
        });
    }
});
```

## 向后兼容性

为了保持向后兼容，旧的 `createGetAPI` 和 `createPostAPI` 函数仍然可用，它们内部调用新的 `createApi` 函数：

```javascript
// 旧语法仍然可用
export default createPostAPI(user.login, async (data, context) => {
    // 处理逻辑
});

// 等价于新语法
export default createApi({
    name: 'POST API (Legacy)',
    schema: user.login,
    method: 'post',
    handler: async (data, context) => {
        // 处理逻辑
    }
});
```

## 优势

1. **统一性**: 所有 API 使用相同的定义模式
2. **可读性**: 配置对象清晰地表达了 API 的各个方面
3. **扩展性**: 未来可以轻松添加新的配置选项
4. **调试友好**: 通过 `name` 字段提供更好的错误信息
5. **插件化**: 每个 API 都是独立的插件，可以单独导入使用

## 迁移指南

### 从旧的 createPostAPI 迁移

```javascript
// 旧代码
export default createPostAPI(rules, handler);

// 新代码
export default createApi({
    name: '接口名称',
    schema: rules,
    method: 'post',
    handler: handler
});
```

### 从旧的 createGetAPI 迁移

```javascript
// 旧代码
export default createGetAPI(rules, handler);

// 新代码
export default createApi({
    name: '接口名称',
    schema: rules,
    method: 'get',
    handler: handler
});
```

## API 元信息

每个通过 `createApi` 创建的处理器都会附带元信息：

```javascript
const api = createApi({
    /* config */
});

console.log(api.__isBunflyAPI__); // true
console.log(api.__apiName__); // 接口名称
console.log(api.__apiMethod__); // HTTP 方法
console.log(api.__apiSchema__); // 验证规则
```

这些信息可用于调试、文档生成或路由检查。
