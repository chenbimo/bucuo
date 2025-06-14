# Bunfly SQL 查询构造器

基于 Knex.js 设计理念的轻量级 SQL 查询构造器，专为 Bun 环境优化。

## 特性

-   ✅ **链式调用** - 流畅的 API 设计
-   ✅ **类型安全** - 参数绑定防止 SQL 注入
-   ✅ **零依赖** - 纯 JavaScript 实现
-   ✅ **Bun 优化** - 充分利用 Bun 的原生能力
-   ✅ **Knex 兼容** - 熟悉的 API 设计
-   ✅ **事务支持** - 简单的事务管理
-   ✅ **多种查询** - SELECT、INSERT、UPDATE、DELETE
-   ✅ **聚合函数** - COUNT、SUM、AVG、MAX、MIN
-   ✅ **连接查询** - INNER、LEFT、RIGHT JOIN
-   ✅ **复杂条件** - WHERE、OR、IN、BETWEEN、LIKE 等

## 基本用法

### 导入

```javascript
import { createSQL, table } from '@bunfly/core';

// 或者从具体路径导入
import { createSQL, table } from './libs/sql.js';
```

### 快速开始

```javascript
// 创建 SQL 实例
const sql = createSQL();

// 或者使用便捷的 table 函数
const query = table('users').select('*').where('age', '>', 18);
const { sql: sqlString, bindings } = query.toSQL();

console.log(sqlString); // SELECT * FROM users WHERE age > ?
console.log(bindings); // [18]
```

## 查询构造器 API

### SELECT 查询

```javascript
// 基础查询
table('users').select('*');
table('users').select('id', 'name', 'email');
table('users').select(['id', 'name', 'email']);

// 指定表名
table('users').select('id').from('users');
```

### WHERE 条件

```javascript
// 基础条件
table('users').where('age', 18);
table('users').where('age', '>', 18);
table('users').where('status', '=', 'active');

// 对象语法
table('users').where({
    status: 'active',
    role: 'admin'
});

// OR 条件
table('users').where('role', 'admin').orWhere('role', 'moderator');

// WHERE IN
table('users').whereIn('id', [1, 2, 3, 4]);
table('users').whereNotIn('status', ['banned', 'deleted']);

// NULL 查询
table('users').whereNull('deleted_at');
table('users').whereNotNull('email');

// BETWEEN 查询
table('orders').whereBetween('created_at', ['2024-01-01', '2024-12-31']);

// LIKE 查询
table('users').whereLike('name', '%john%');
```

### JOIN 连接

```javascript
// INNER JOIN
table('users').select('users.name', 'posts.title').join('posts', 'users.id', '=', 'posts.user_id');

// LEFT JOIN
table('users').select('users.name', 'profiles.bio').leftJoin('profiles', 'users.id', '=', 'profiles.user_id');

// RIGHT JOIN
table('orders').rightJoin('customers', 'orders.customer_id', '=', 'customers.id');
```

### 排序和分组

```javascript
// ORDER BY
table('users').orderBy('name');
table('users').orderBy('name', 'DESC');
table('users').orderBy(['name', { column: 'age', order: 'DESC' }]);

// GROUP BY
table('orders').select('user_id').count('id').groupBy('user_id');

// HAVING
table('orders').select('user_id').count('id').groupBy('user_id').having('count', '>', 5);
```

### 限制和偏移

```javascript
// LIMIT
table('users').limit(10);

// OFFSET
table('users').limit(10).offset(20);

// 分页
table('users').select('*').orderBy('id').limit(10).offset(20);
```

### 聚合函数

```javascript
// 计数
table('users').count(); // COUNT(*)
table('users').count('id'); // COUNT(id)

// 求和
table('orders').sum('amount');

// 平均值
table('products').avg('price');

// 最大值/最小值
table('users').max('age');
table('users').min('age');

// 获取第一条记录
table('users').select('*').where('email', 'john@example.com').first();
```

### INSERT 查询

```javascript
// 插入单条记录
table('users').insert({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25
});

// 批量插入
table('users').insert([
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' }
]);
```

### UPDATE 查询

```javascript
// 更新记录
table('users').where('id', 1).update({
    name: 'Jane Doe',
    email: 'jane@example.com'
});

// 批量更新
table('users').where('status', 'inactive').update({ status: 'archived' });
```

### DELETE 查询

```javascript
// 删除记录
table('users').where('status', 'banned').delete();

// 条件删除
table('logs').where('created_at', '<', '2024-01-01').delete();
```

## 数据库集成

### 与 Bun SQLite 集成

```javascript
import { Database } from 'bun:sqlite';
import { createSQL, table } from '@bunfly/core';

// 创建数据库连接
const db = new Database('./database.db');

// 创建 SQL 实例
const sql = createSQL(db);

// 执行查询
async function getActiveUsers() {
    const query = table('users').select('*').where('status', 'active').orderBy('created_at', 'DESC').limit(10);

    const users = await sql.execute(query);
    return users;
}

// 获取单条记录
async function getUserByEmail(email) {
    const query = table('users').select('*').where('email', email).first();

    const user = await sql.first(query);
    return user;
}

// 插入数据
async function createUser(userData) {
    const query = table('users').insert(userData);
    await sql.execute(query);
}
```

### 事务支持

```javascript
async function transferMoney(fromUserId, toUserId, amount) {
    await sql.transaction(async (trx) => {
        // 扣除发送方余额
        await trx.execute(table('accounts').where('user_id', fromUserId).update({ balance: 'balance - ?' }, [amount]));

        // 增加接收方余额
        await trx.execute(table('accounts').where('user_id', toUserId).update({ balance: 'balance + ?' }, [amount]));

        // 记录转账记录
        await trx.execute(
            table('transactions').insert({
                from_user_id: fromUserId,
                to_user_id: toUserId,
                amount: amount,
                type: 'transfer',
                created_at: new Date().toISOString()
            })
        );
    });
}
```

### 原始 SQL 查询

```javascript
// 执行原始 SQL
const rawQuery = sql.raw('SELECT * FROM users WHERE age > ? AND status = ?', [18, 'active']);

const results = await sql.execute(rawQuery);

// 复杂统计查询
const statsQuery = sql.raw(
    `
    SELECT
        DATE(created_at) as date,
        COUNT(*) as user_count,
        AVG(age) as avg_age
    FROM users
    WHERE created_at >= ?
    GROUP BY DATE(created_at)
    ORDER BY date DESC
`,
    ['2024-01-01']
);

const stats = await sql.execute(statsQuery);
```

## 高级用法

### 复杂查询示例

```javascript
// 多表连接查询
const complexQuery = table('orders').select('users.name as customer_name', 'orders.total', 'products.title as product_name', 'order_items.quantity').join('users', 'orders.user_id', '=', 'users.id').join('order_items', 'orders.id', '=', 'order_items.order_id').join('products', 'order_items.product_id', '=', 'products.id').where('orders.status', 'completed').where('orders.total', '>', 100).whereIn('users.role', ['customer', 'vip']).whereBetween('orders.created_at', ['2024-01-01', '2024-12-31']).orderBy('orders.created_at', 'DESC').limit(50);

const results = await sql.execute(complexQuery);
```

### 查询构造器克隆

```javascript
// 基础查询
const baseQuery = table('users').select('*').where('status', 'active');

// 克隆并添加条件
const adminQuery = baseQuery.clone().where('role', 'admin');
const recentQuery = baseQuery.clone().where('created_at', '>', '2024-01-01');

// 原查询不受影响
console.log(baseQuery.toSQL()); // 只有 status = 'active'
console.log(adminQuery.toSQL()); // status = 'active' AND role = 'admin'
console.log(recentQuery.toSQL()); // status = 'active' AND created_at > '2024-01-01'
```

## 在 Bunfly API 中使用

### 创建数据库 API

```javascript
import { createPostAPI, createGetAPI, table } from '@bunfly/core';
import { Database } from 'bun:sqlite';

const db = new Database('./api.db');
const sql = createSQL(db);

// 获取用户列表 API
export default createGetAPI({
    name: '获取用户列表',
    schema: {
        fields: {
            page: 'number',
            limit: 'number',
            status: 'string'
        },
        required: []
    },
    handler: async ({ query }) => {
        const { page = 1, limit = 10, status } = query;
        const offset = (page - 1) * limit;

        let userQuery = table('users').select('id', 'name', 'email', 'status', 'created_at').orderBy('created_at', 'DESC').limit(limit).offset(offset);

        if (status) {
            userQuery = userQuery.where('status', status);
        }

        const users = await sql.execute(userQuery);

        // 获取总数
        const countQuery = table('users').count('id');
        if (status) {
            countQuery.where('status', status);
        }
        const [{ count: total }] = await sql.execute(countQuery);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
});
```

### 创建用户 API

```javascript
export default createPostAPI({
    name: '创建用户',
    schema: {
        fields: {
            name: 'string',
            email: 'string',
            age: 'number'
        },
        required: ['name', 'email']
    },
    handler: async ({ body }) => {
        const { name, email, age } = body;

        // 检查邮箱是否已存在
        const existingUser = await sql.first(table('users').select('id').where('email', email));

        if (existingUser) {
            throw new Error('邮箱已存在');
        }

        // 创建用户
        const userData = {
            name,
            email,
            age: age || null,
            status: 'active',
            created_at: new Date().toISOString()
        };

        await sql.execute(table('users').insert(userData));

        return { message: '用户创建成功', user: userData };
    }
});
```

## 性能优化建议

1. **使用索引**: 确保 WHERE 和 JOIN 字段有合适的索引
2. **限制结果**: 使用 LIMIT 避免返回过多数据
3. **选择特定字段**: 避免使用 `SELECT *`，只选择需要的字段
4. **批量操作**: 使用批量插入而不是循环单条插入
5. **连接池**: 在生产环境中使用连接池管理数据库连接

## 注意事项

-   确保所有用户输入都通过查询构造器传递，避免直接拼接 SQL
-   在生产环境中启用查询日志来监控性能
-   使用事务确保数据一致性
-   定期分析慢查询并优化

## 与 Knex.js 的对比

| 功能     | Bunfly SQL | Knex.js |
| -------- | ---------- | ------- |
| 链式调用 | ✅         | ✅      |
| 参数绑定 | ✅         | ✅      |
| 事务支持 | ✅         | ✅      |
| 连接查询 | ✅         | ✅      |
| 聚合函数 | ✅         | ✅      |
| 原始 SQL | ✅         | ✅      |
| 多数据库 | ❌         | ✅      |
| 迁移工具 | ❌         | ✅      |
| 包大小   | 📦 小      | 📦 大   |
| Bun 优化 | ✅         | ❌      |

Bunfly SQL 构造器专注于提供 Knex.js 的核心功能，同时保持轻量级和对 Bun 的最佳兼容性。
