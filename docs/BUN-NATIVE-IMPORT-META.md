# 使用 Bun 原生 import.meta API 替代 Node.js API

## 改进概述

将 `fileURLToPath` 和 `__dirname` 替换为 Bun 原生的 `import.meta` API，进一步减少对 Node.js API 的依赖。

## Bun 原生 API

根据 [Bun 官方文档](https://bun.sh/docs/api/import-meta)，Bun 提供了以下原生 API：

```javascript
import.meta.dir; // => "/path/to/project" (等同于 __dirname)
import.meta.file; // => "file.ts" (文件名)
import.meta.path; // => "/path/to/project/file.ts" (等同于 __filename)
import.meta.url; // => "file:///path/to/project/file.ts"

// 兼容性别名
import.meta.dirname; // => import.meta.dir 的别名
import.meta.filename; // => import.meta.path 的别名
```

## 替换对比

### 之前的 Node.js 方式

```javascript
import { fileURLToPath } from 'url';
import path from 'path';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginDir = path.join(__dirname, 'plugins');
```

### 现在的 Bun 原生方式

```javascript
import path from 'path';

// 直接使用 Bun 原生 API
const pluginDir = path.join(import.meta.dir, 'plugins');
```

## 优势

1. **更简洁**: 减少了导入和中间变量
2. **更高效**: 使用 Bun 原生实现，性能更好
3. **更符合 Bun 生态**: 利用 Bun 特有的功能
4. **减少依赖**: 不再需要 Node.js 的 `url` 模块

## 完整的 API 对照表

| Node.js                                        | Bun 原生           | 说明                       |
| ---------------------------------------------- | ------------------ | -------------------------- |
| `__dirname`                                    | `import.meta.dir`  | 当前文件所在目录的绝对路径 |
| `__filename`                                   | `import.meta.path` | 当前文件的绝对路径         |
| `fileURLToPath(import.meta.url)`               | `import.meta.path` | 文件路径转换               |
| `path.dirname(fileURLToPath(import.meta.url))` | `import.meta.dir`  | 目录路径获取               |

## 其他可用的 import.meta 属性

```javascript
import.meta.main; // 是否为入口文件
import.meta.resolve; // 模块解析
import.meta.env; // 环境变量 (等同于 process.env)
```

## 应用场景

这个改进特别适用于：

-   插件目录路径计算
-   配置文件路径获取
-   静态资源路径构建
-   模块相对路径解析

## 未来优化建议

可以考虑进一步使用 Bun 的其他原生 API：

-   使用 `import.meta.resolve()` 替代复杂的模块路径解析
-   使用 `import.meta.env` 替代 `process.env`
-   使用 Bun 的原生文件 API 替代 Node.js 的 `fs` 模块

这样可以最大化利用 Bun 的性能优势，真正实现"为 Bun 量身打造"的框架特性。
