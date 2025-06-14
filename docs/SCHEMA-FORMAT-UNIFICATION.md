# Schema 文件格式统一调整报告

## 调整概述

所有 schema 文件已按照 `user.json` 的格式进行统一调整，采用直接字段定义的简化格式。

## 新的 Schema 格式

参考 `user.json` 的格式，所有 schema 文件现在使用以下结构：

```json
{
    "fieldName": "type,description,minLength,maxLength,pattern",
    "fieldName2": "type,description,minLength,maxLength,pattern"
}
```

### 字段定义格式说明

-   `type`: 字段类型（string/number/array）
-   `description`: 字段描述（中文）
-   `minLength`: 最小长度或最小值
-   `maxLength`: 最大长度或最大值
-   `pattern`: 正则表达式验证（可选）

## 调整的文件

### ✅ 已调整完成

1. **packages/core/schema/common.json**

    - 移除了 `description`、`commonRules`、`presets` 结构
    - 保留核心通用字段：id、email、phone、page、limit 等
    - 采用直接字段定义格式

2. **packages/core/schema/health.json**

    - 简化为空对象 `{}`
    - 健康检查接口不需要参数验证

3. **packages/core/schema/debug.json**

    - 简化为空对象 `{}`
    - 调试接口不需要参数验证

4. **packages/core/schema/tool.json**

    - 移除了 `description`、`toolRules`、`presets` 结构
    - 保留工具相关字段：filename、content、type、path
    - 采用直接字段定义格式

5. **packages/api/schema/stats.json**

    - 简化为空对象 `{}`
    - 统计接口暂时不需要参数验证

6. **packages/api/schema/user.json** ✅ （参考标准）
    - 保持现有格式不变

## 使用方式变更

### 之前的使用方式

```javascript
// 复杂的引用和预设
import { processSchema } from '../../libs/simple-schema.js';
import userSchema from '../../schema/user.json';
import commonSchema from '../../schema/common.json';

const { login } = processSchema(userSchema, commonSchema.commonRules);

export default createApi({
    schema: login
    // ...
});
```

### 现在的使用方式

```javascript
// 直接使用字段
import userSchema from '../../schema/user.json';

export default createApi({
    schema: {
        fields: [userSchema.username, userSchema.password],
        required: ['username', 'password']
    }
    // ...
});
```

## 优势

1. **更简洁**: 移除了复杂的嵌套结构和引用关系
2. **更直观**: 字段定义一目了然
3. **更灵活**: 可以在接口中灵活组合字段
4. **更易维护**: 减少了抽象层次，便于理解和修改

## 示例用法

### 用户登录接口

```javascript
import userSchema from '../../schema/user.json';

export default createApi({
    schema: {
        fields: [userSchema.username, userSchema.password],
        required: ['username', 'password']
    }
    // ...
});
```

### 文件上传接口

```javascript
import toolSchema from '../../schema/tool.json';

export default createApi({
    schema: {
        fields: [toolSchema.filename, toolSchema.content],
        required: ['filename']
    }
    // ...
});
```

### 分页查询接口

```javascript
import commonSchema from '../../schema/common.json';

export default createApi({
    schema: {
        fields: [commonSchema.page, commonSchema.limit],
        required: []
    }
    // ...
});
```

## 注意事项

1. **字段引用**: 现在直接通过 `schema.fieldName` 引用字段
2. **组合使用**: 可以跨 schema 文件组合字段
3. **空 schema**: 不需要验证的接口使用空的 fields 数组
4. **向后兼容**: 旧的 `processSchema` 函数仍然保留但已弃用

## 下一步

1. 测试所有接口确保 schema 验证正常工作
2. 更新相关文档和示例
3. 完全移除 `simple-schema.js` 中不再使用的代码
4. 考虑添加 TypeScript 类型定义以提供更好的开发体验
