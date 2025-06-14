# JSON Schema 直接导入模式

## 概述

现在 Bunfly 的 schema 系统已经完全重构为 JSON 配置文件，并且移除了统一的 index.js 导出文件。每个接口都直接导入具体的 schema 文件，使依赖关系更加清晰和简单。

## 目录结构

```
packages/
├── core/
│   ├── schema/
│   │   ├── common.json      # 通用验证规则
│   │   ├── health.json      # 健康检查规则
│   │   ├── tool.json        # 工具接口规则
│   │   └── debug.json       # 调试接口规则
│   └── libs/
│       └── simple-schema.js # JSON schema 加载工具
└── api/
    └── schema/
        ├── user.json        # 用户相关规则
        └── stats.json       # 统计相关规则
```

## JSON Schema 格式

每个 schema 文件都采用统一的 JSON 格式：

```json
{
    "description": "模块描述",
    "xxxRules": {
        "fieldName": "type,label,min,max,pattern"
    },
    "presets": {
        "presetName": {
            "field1": "xxxRules.fieldName",
            "field2": "commonRules.fieldName"
        }
    }
}
```

### 字段说明

-   **description**: 模块的文字描述
-   **xxxRules**: 字段池，定义基础的验证规则
-   **presets**: 预设组合，将多个字段组合成接口验证规则

## 使用方式

### 在接口文件中导入

```javascript
import { createApi } from '../../libs/http.js';
import { loadSchema } from '../../libs/simple-schema.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载用户 schema
const userSchemaPath = join(__dirname, '../../schema/user.json');
const { login, register, update } = loadSchema(userSchemaPath);

// 使用预设规则
export default createApi({
    name: '用户登录',
    schema: login,
    method: 'post',
    handler: async (data, context) => {
        // 处理逻辑
    }
});
```

### 规则引用解析

JSON 中的规则引用会自动解析：

```json
{
    "userRules": {
        "username": "string,用户名,3,20"
    },
    "presets": {
        "login": {
            "username": "userRules.username",
            "password": "userRules.password",
            "email": "commonRules.email"
        }
    }
}
```

`loadSchema()` 会自动：

1. 解析 `userRules.username` 为具体的规则字符串
2. 解析 `commonRules.email` 为通用规则
3. 返回完整的验证规则对象

## 示例文件

### common.json

```json
{
    "description": "核心通用验证规则",
    "commonRules": {
        "id": "number,ID,1,999999999",
        "email": "string,邮箱,5,100,^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        "page": "number,页码,1,9999",
        "limit": "number,每页数量,1,100"
    },
    "presets": {
        "pagination": {
            "page": "commonRules.page",
            "limit": "commonRules.limit"
        },
        "id": {
            "id": "commonRules.id"
        }
    }
}
```

### user.json

```json
{
    "description": "用户相关验证规则",
    "userRules": {
        "username": "string,用户名,3,20,^[a-zA-Z0-9_]+$",
        "password": "string,密码,6,100",
        "nickname": "string,昵称,2,50"
    },
    "presets": {
        "login": {
            "username": "userRules.username",
            "password": "userRules.password"
        },
        "register": {
            "username": "userRules.username",
            "password": "userRules.password",
            "email": "commonRules.email",
            "nickname": "userRules.nickname"
        }
    }
}
```

## 优势

1. **配置与代码分离**: 验证规则纯粹化，易于维护
2. **直接导入**: 无需复杂的统一导出，依赖关系清晰
3. **按需加载**: 只加载需要的 schema 文件
4. **缓存机制**: 自动缓存已加载的 schema，提高性能
5. **引用解析**: 自动解析跨模块的规则引用
6. **类型安全**: JSON 格式便于工具检查和验证

## 迁移完成

-   ✅ 删除了所有 schema/index.js 统一导出文件
-   ✅ 将所有 .js schema 文件转换为 .json 格式
-   ✅ 创建了简化的 simple-schema.js 加载工具
-   ✅ 更新了所有接口文件，直接导入具体的 schema 文件
-   ✅ 保持了规则引用和自动解析功能
-   ✅ 清理了旧的 schema-loader.js 文件

现在整个 schema 系统更加简洁和直观，每个接口都明确知道自己依赖的验证规则来源。
