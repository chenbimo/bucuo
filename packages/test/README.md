# Bunpi 测试套件

这个包包含了 Bunpi 项目的所有测试文件，使用 Vitest 测试框架。

## 目录结构

```
packages/test/
├── core/               # Core 包的测试
│   └── libs/          # Core 库测试
│       └── validator.test.js
├── api/               # API 包的测试
│   └── user/          # 用户相关API测试
│       └── user.test.js
├── package.json       # 测试包配置
├── index.js          # 测试入口文件
└── README.md         # 说明文档
```

## 测试命令

### 基本命令

```bash
# 运行所有测试
bun run test

# 监听模式运行测试
bun run test:watch

# 运行测试并显示覆盖率
bun run test:coverage

# 使用UI界面运行测试
bun run test:ui
```

### 特定模块测试

```bash
# 只测试 Core 模块
bun run test:core

# 只测试 API 模块
bun run test:api

# 只测试验证器
bun run test:validator
```

## 从根目录运行测试

在项目根目录下也可以运行测试：

```bash
# 运行所有测试
bun test

# 监听模式
bun run test:watch

# 覆盖率测试
bun run test:coverage

# UI界面测试
bun run test:ui
```

## 测试文件规范

### 文件命名

-   测试文件必须以 `.test.js` 或 `.spec.js` 结尾
-   测试文件应该与被测试的模块保持相同的目录结构

### 测试结构

```javascript
import { describe, it, expect } from 'vitest';
import { functionToTest } from '../../path/to/module.js';

describe('模块名称测试', () => {
    describe('功能分组', () => {
        it('应该测试某个具体功能', () => {
            // 测试代码
            expect(result).toBe(expected);
        });
    });
});
```

## 配置说明

测试配置在根目录的 `vitest.config.ts` 中定义，包括：

-   测试文件匹配模式
-   覆盖率配置
-   测试环境设置
-   并发设置

## 添加新测试

1. 在对应的模块目录下创建测试文件
2. 按照测试规范编写测试用例
3. 更新相应的 package.json 脚本（如需要）
4. 确保测试通过后提交代码
