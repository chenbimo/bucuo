# Bun 原生 JSON 导入支持

## 概述

Bun 框架现在充分利用了 Bun 运行时的原生 JSON 导入能力，进一步简化了 schema 的使用方式。

## Bun 原生 JSON 导入

根据 [Bun 官方文档](https://bun.sh/docs/bundler/loaders#json)，Bun 原生支持直接导入 JSON 文件：

```javascript
import pkg from './package.json';
pkg.name; // => "my-package"
```

## 新的 Schema 使用方式

### 之前的方式（已弃用）

```javascript
import { loadSchema } from '../../libs/simple-schema.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const schemaPath = join(__dirname, '../../schema/health.json');
const { check } = loadSchema(schemaPath);
```

### 新的方式（推荐）

```javascript
import { processSchema } from '../../libs/simple-schema.js';
import healthSchema from '../../schema/health.json';
import commonSchema from '../../schema/common.json';

const { check } = processSchema(healthSchema, commonSchema.commonRules);
```

## 优势

1. **更简洁**：无需处理文件路径和 `__dirname`
2. **性能更好**：利用 Bun 的原生 JSON 加载器
3. **类型友好**：TypeScript 能更好地推断类型
4. **更可靠**：编译时检查文件是否存在

## API 示例

### 健康检查接口

```javascript
/**
 * 健康检查 API - /core/health/check
 */

import { createApi } from '../../libs/http.js';
import { processSchema } from '../../libs/simple-schema.js';
import healthSchema from '../../schema/health.json';
import commonSchema from '../../schema/common.json';

const { check } = processSchema(healthSchema, commonSchema.commonRules);

export default createApi({
    name: '健康检查',
    schema: check,
    method: 'get',
    handler: async (data, context) => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            runtime: 'Bun',
            version: Bun.version,
            platform: process.platform,
            arch: process.arch
        };
    }
});
```

### 用户登录接口

```javascript
/**
 * 用户登录 API - /user/auth/login
 */

import { createApi, createRes, ERROR_CODES } from 'bunfly';
import { processSchema } from '../../../core/libs/simple-schema.js';
import userSchema from '../../../schema/user.json';
import commonSchema from '../../../core/schema/common.json';

const { login } = processSchema(userSchema, commonSchema.commonRules);

export default createApi({
    name: '用户登录',
    schema: login,
    method: 'post',
    handler: async (data, context) => {
        // 登录逻辑
    }
});
```

## 跨包引用

在 monorepo 结构中，可以跨包引用 schema：

```javascript
// 在 api 包中引用 core 包的 common schema
import commonSchema from '../../../core/schema/common.json';
import userSchema from '../../../schema/user.json';

const { userCreate } = processSchema(userSchema, commonSchema.commonRules);
```

## 迁移指南

1. **更新导入语句**：将 `loadSchema` 改为 `processSchema`
2. **直接导入 JSON**：使用 `import schema from './schema.json'`
3. **移除路径计算**：删除 `__dirname` 和 `join` 相关代码
4. **传递 commonRules**：如需通用规则，传递 `commonSchema.commonRules`

## 向后兼容

旧的 `loadSchema` 函数仍然可用但已标记为弃用，建议尽快迁移到新方式。

## 工具函数

### processSchema(rawSchema, commonRules?)

处理已导入的 JSON schema 对象，解析引用和构建预设组合。

-   `rawSchema`: 直接导入的 JSON schema 对象
-   `commonRules`: 可选的通用规则对象（来自 common.json）
-   返回: 包含规则字段池和预设组合的对象

### extendRules(baseRules, additionalRules)

扩展验证规则，合并两个规则对象。

### createRules(fields, rulesPool)

从规则池中创建指定字段的验证规则组合。
