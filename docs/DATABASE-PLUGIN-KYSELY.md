# Bunfly 数据库插件 - Kysely 集成

## 概述

Bunfly 数据库插件基于 [Kysely](https://kysely.dev/) 构建，提供类型安全的 SQL 查询构建器。Kysely 是一个现代化的 TypeScript SQL 查询构建器，支持 PostgreSQL、MySQL 和 SQLite。

## 特性

-   🔒 **类型安全** - 完整的 TypeScript 类型支持
-   🗄️ **多数据库支持** - PostgreSQL、MySQL、SQLite
-   🚀 **高性能** - 优化的查询构建和连接池
-   🔧 **灵活配置** - 支持多种数据库配置选项
-   📝 **SQL 构建器** - 链式 API，易于使用
-   🔄 **事务支持** - 完整的事务处理能力
-   📊 **连接池管理** - 自动连接池管理
-   🐛 **调试友好** - 可选的 SQL 查询日志

## 安装依赖

数据库插件已包含在 core 包中，相关依赖会自动安装：

```bash
# 自动安装的依赖
bun add kysely pg mysql2 better-sqlite3
```

## 配置

### PostgreSQL 配置

```javascript
const app = new Bunfly({
    database: {
        enabled: true,
        dialect: 'postgresql',
        host: 'localhost',
        port: 5432,
        database: 'myapp',
        user: 'postgres',
        password: 'password',
        pool: {
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000
        },
        logging: true,
        testConnection: true
    }
});
```

### MySQL 配置

```javascript
const app = new Bunfly({
    database: {
        enabled: true,
        dialect: 'mysql',
        host: 'localhost',
        port: 3306,
        database: 'myapp',
        user: 'root',
        password: 'password',
        pool: {
            max: 10,
            acquireTimeout: 60000,
            timeout: 60000
        },
        logging: false
    }
});
```

### SQLite 配置

```javascript
const app = new Bunfly({
    database: {
        enabled: true,
        dialect: 'sqlite',
        filename: './data/app.db', // 或 ':memory:' 用于内存数据库
        logging: false
    }
});
```

## 使用方法

### 注册插件

```javascript
import { Bunfly } from 'bunfly';
import dbPlugin from 'bunfly/plugins/db.js';

const app = new Bunfly(config);
app.plugin(dbPlugin);
```

### 在 API 中使用

```javascript
import { createApi, createRes, ERROR_CODES } from 'bunfly';

export default createApi({
    name: '获取用户列表',
    handler: async (data, context) => {
        const { db } = context; // 数据库实例

        const users = await db.selectFrom('users').select(['id', 'username', 'email']).where('active', '=', true).orderBy('created_at', 'desc').limit(10).execute();

        return createRes(ERROR_CODES.SUCCESS, '获取成功', users);
    }
});
```

## 查询示例

### 基础查询

```javascript
// 查询所有活跃用户
const users = await db.selectFrom('users').select(['id', 'username', 'email']).where('active', '=', true).execute();

// 条件查询
const user = await db.selectFrom('users').selectAll().where('username', '=', 'admin').executeTakeFirst();

// 分页查询
const users = await db.selectFrom('users').select(['id', 'username', 'email']).orderBy('created_at', 'desc').limit(20).offset(40).execute();
```

### 联表查询

```javascript
// LEFT JOIN
const usersWithProfiles = await db.selectFrom('users').leftJoin('user_profiles', 'users.id', 'user_profiles.user_id').select(['users.id', 'users.username', 'user_profiles.nickname', 'user_profiles.avatar']).where('users.active', '=', true).execute();

// 复杂联表
const result = await db
    .selectFrom('orders')
    .innerJoin('users', 'orders.user_id', 'users.id')
    .leftJoin('order_items', 'orders.id', 'order_items.order_id')
    .select(['orders.id as order_id', 'users.username', 'orders.total_amount', (eb) => eb.fn.count('order_items.id').as('item_count')])
    .groupBy(['orders.id', 'users.username', 'orders.total_amount'])
    .execute();
```

### 插入数据

```javascript
// 插入单条记录
const newUser = await db
    .insertInto('users')
    .values({
        username: 'newuser',
        email: 'newuser@example.com',
        created_at: new Date()
    })
    .returning(['id', 'username'])
    .executeTakeFirstOrThrow();

// 插入多条记录
const newUsers = await db
    .insertInto('users')
    .values([
        { username: 'user1', email: 'user1@example.com' },
        { username: 'user2', email: 'user2@example.com' }
    ])
    .returning(['id', 'username'])
    .execute();

// UPSERT (PostgreSQL/MySQL)
const user = await db.insertInto('users').values({ username: 'admin', email: 'admin@example.com' }).onConflict('username').doUpdateSet({ email: 'admin@example.com' }).returning(['id', 'username']).executeTakeFirst();
```

### 更新数据

```javascript
// 基础更新
await db
    .updateTable('users')
    .set({
        last_login: new Date(),
        login_count: db.raw('login_count + 1')
    })
    .where('id', '=', userId)
    .execute();

// 条件更新
const result = await db.updateTable('users').set({ active: false }).where('last_login', '<', new Date('2023-01-01')).returning(['id', 'username']).execute();
```

### 删除数据

```javascript
// 删除记录
await db.deleteFrom('users').where('active', '=', false).where('created_at', '<', new Date('2022-01-01')).execute();

// 软删除
await db.updateTable('users').set({ deleted_at: new Date() }).where('id', '=', userId).execute();
```

### 聚合查询

```javascript
// 统计查询
const stats = await db
    .selectFrom('users')
    .select([(eb) => eb.fn.count('id').as('total_count'), (eb) => eb.fn.count('id').filterWhere('active', '=', true).as('active_count'), (eb) => eb.fn.avg('age').as('average_age'), (eb) => eb.fn.max('created_at').as('latest_registration')])
    .executeTakeFirst();

// 分组统计
const monthlyStats = await db
    .selectFrom('orders')
    .select([(eb) => eb.fn('date_trunc', ['month', 'created_at']).as('month'), (eb) => eb.fn.count('id').as('order_count'), (eb) => eb.fn.sum('total_amount').as('total_revenue')])
    .groupBy((eb) => eb.fn('date_trunc', ['month', 'created_at']))
    .orderBy('month', 'desc')
    .execute();
```

### 事务处理

```javascript
// 简单事务
const result = await db.transaction().execute(async (trx) => {
    const user = await trx.insertInto('users').values({ username: 'test', email: 'test@example.com' }).returning('id').executeTakeFirstOrThrow();

    await trx.insertInto('user_profiles').values({ user_id: user.id, nickname: 'Test User' }).execute();

    return user;
});

// 复杂事务（转账示例）
const transfer = await db.transaction().execute(async (trx) => {
    // 锁定账户行
    const accounts = await trx.selectFrom('accounts').select(['id', 'user_id', 'balance']).where('user_id', 'in', [fromUserId, toUserId]).forUpdate().execute();

    const fromAccount = accounts.find((a) => a.user_id === fromUserId);
    const toAccount = accounts.find((a) => a.user_id === toUserId);

    if (!fromAccount || fromAccount.balance < amount) {
        throw new Error('余额不足');
    }

    // 更新余额
    await trx
        .updateTable('accounts')
        .set({ balance: trx.raw('balance - ?', [amount]) })
        .where('id', '=', fromAccount.id)
        .execute();

    await trx
        .updateTable('accounts')
        .set({ balance: trx.raw('balance + ?', [amount]) })
        .where('id', '=', toAccount.id)
        .execute();

    // 记录转账日志
    return await trx
        .insertInto('transfer_logs')
        .values({
            from_account_id: fromAccount.id,
            to_account_id: toAccount.id,
            amount,
            created_at: new Date()
        })
        .returning(['id', 'amount'])
        .executeTakeFirstOrThrow();
});
```

### 原生 SQL

```javascript
// 执行原生 SQL
const result = await db.selectFrom(db.raw('generate_series(1, 10) as numbers(n)')).select('n').execute();

// 复杂原生查询
const customQuery = await db
    .with('monthly_sales', (db) =>
        db
            .selectFrom('orders')
            .select([db.raw("date_trunc('month', created_at) as month"), db.fn.sum('total_amount').as('sales')])
            .groupBy(db.raw("date_trunc('month', created_at)"))
    )
    .selectFrom('monthly_sales')
    .selectAll()
    .orderBy('month', 'desc')
    .execute();
```

## 配置选项

### 数据库配置

| 选项             | 类型    | 默认值      | 说明                                        |
| ---------------- | ------- | ----------- | ------------------------------------------- |
| `enabled`        | boolean | false       | 是否启用数据库插件                          |
| `dialect`        | string  | -           | 数据库类型：'postgresql', 'mysql', 'sqlite' |
| `host`           | string  | 'localhost' | 数据库主机                                  |
| `port`           | number  | -           | 数据库端口（PostgreSQL: 5432, MySQL: 3306） |
| `database`       | string  | -           | 数据库名称                                  |
| `user`           | string  | -           | 用户名                                      |
| `password`       | string  | -           | 密码                                        |
| `filename`       | string  | -           | SQLite 数据库文件路径                       |
| `logging`        | boolean | false       | 是否启用 SQL 查询日志                       |
| `testConnection` | boolean | true        | 启动时是否测试数据库连接                    |

### 连接池配置

#### PostgreSQL

| 选项                           | 类型   | 默认值 | 说明             |
| ------------------------------ | ------ | ------ | ---------------- |
| `pool.max`                     | number | 10     | 最大连接数       |
| `pool.idleTimeoutMillis`       | number | 30000  | 空闲连接超时时间 |
| `pool.connectionTimeoutMillis` | number | 2000   | 连接超时时间     |

#### MySQL

| 选项                  | 类型   | 默认值 | 说明             |
| --------------------- | ------ | ------ | ---------------- |
| `pool.max`            | number | 10     | 最大连接数       |
| `pool.acquireTimeout` | number | 60000  | 获取连接超时时间 |
| `pool.timeout`        | number | 60000  | 查询超时时间     |

## 最佳实践

### 1. 错误处理

```javascript
export default createApi({
    handler: async (data, context) => {
        const { db } = context;

        try {
            const result = await db.selectFrom('users').selectAll().execute();

            return createRes(ERROR_CODES.SUCCESS, '查询成功', result);
        } catch (error) {
            console.error('数据库查询失败:', error);

            // 根据错误类型返回不同的响应
            if (error.code === 'ECONNREFUSED') {
                return createRes(ERROR_CODES.SERVER_ERROR, '数据库连接失败');
            }

            return createRes(ERROR_CODES.SERVER_ERROR, '查询失败');
        }
    }
});
```

### 2. 查询优化

```javascript
// ✅ 好的做法：只选择需要的字段
const users = await db
    .selectFrom('users')
    .select(['id', 'username', 'email']) // 只选择需要的字段
    .where('active', '=', true)
    .limit(100) // 限制结果数量
    .execute();

// ❌ 避免：选择所有字段
const users = await db
    .selectFrom('users')
    .selectAll() // 避免在大表上使用
    .execute();
```

### 3. 索引使用

```javascript
// ✅ 使用索引字段进行查询
const user = await db
    .selectFrom('users')
    .selectAll()
    .where('id', '=', userId) // id 是主键，有索引
    .executeTakeFirst();

// ✅ 复合索引查询
const orders = await db.selectFrom('orders').selectAll().where('user_id', '=', userId).where('status', '=', 'completed').orderBy('created_at', 'desc').execute();
```

### 4. 事务使用

```javascript
// ✅ 在需要原子性操作时使用事务
const createUserWithProfile = async (userData, profileData) => {
    return await db.transaction().execute(async (trx) => {
        const user = await trx.insertInto('users').values(userData).returning('id').executeTakeFirstOrThrow();

        await trx
            .insertInto('user_profiles')
            .values({ ...profileData, user_id: user.id })
            .execute();

        return user;
    });
};
```

## 性能监控

### 查询日志

启用日志记录以监控查询性能：

```javascript
{
    database: {
        logging: true, // 启用查询日志
        // ...
    }
}
```

### 连接池监控

```javascript
// 获取连接池状态（在需要时添加自定义监控）
const poolStatus = {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingRequests: pool.waitingCount
};
```

## 故障排除

### 常见问题

1. **连接失败**

    ```
    Error: ECONNREFUSED
    ```

    检查数据库服务是否运行，主机和端口配置是否正确。

2. **认证失败**

    ```
    Error: password authentication failed
    ```

    检查用户名和密码是否正确。

3. **数据库不存在**

    ```
    Error: database "myapp" does not exist
    ```

    确保数据库已创建。

4. **表不存在**
    ```
    Error: relation "users" does not exist
    ```
    确保数据库表已创建并运行了必要的迁移。

### 调试技巧

1. **启用查询日志**

    ```javascript
    {
        logging: true;
    }
    ```

2. **查看生成的 SQL**

    ```javascript
    const query = db.selectFrom('users').selectAll();
    console.log(query.compile());
    ```

3. **使用事务调试**
    ```javascript
    await db.transaction().execute(async (trx) => {
        // 在事务中添加日志
        console.log('开始事务操作');
        // ...
    });
    ```

## 类型定义

如果使用 TypeScript，可以定义数据库表的类型：

```typescript
interface Database {
    users: {
        id: number;
        username: string;
        email: string;
        active: boolean;
        created_at: Date;
    };
    user_profiles: {
        id: number;
        user_id: number;
        nickname: string;
        avatar: string | null;
    };
}

const db: Kysely<Database> = context.db;
```

这样可以获得完整的类型安全和 IDE 自动补全支持。
