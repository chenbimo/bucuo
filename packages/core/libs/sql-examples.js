/**
 * Bunfly SQL 构造器使用示例和测试
 * 演示如何使用类似 Knex.js 的 API 构造 SQL 查询
 */

import { createSQL, table } from './sql.js';

// ============= 使用示例 =============

console.log('🔧 Bunfly SQL 构造器示例\n');

// 1. 基础 SELECT 查询
console.log('1. 基础 SELECT 查询:');
const query1 = table('users').select('id', 'name', 'email');
console.log(query1.toSQL());
// 输出: { sql: 'SELECT id, name, email FROM users', bindings: [] }

// 2. 带 WHERE 条件的查询
console.log('\n2. 带 WHERE 条件的查询:');
const query2 = table('users').select('*').where('age', '>', 18).where('status', 'active');
console.log(query2.toSQL());
// 输出: { sql: 'SELECT * FROM users WHERE age > ? AND status = ?', bindings: [18, 'active'] }

// 3. 对象语法 WHERE 条件
console.log('\n3. 对象语法 WHERE 条件:');
const query3 = table('users').select('id', 'name').where({
    status: 'active',
    role: 'admin'
});
console.log(query3.toSQL());
// 输出: { sql: 'SELECT id, name FROM users WHERE status = ? AND role = ?', bindings: ['active', 'admin'] }

// 4. OR 条件查询
console.log('\n4. OR 条件查询:');
const query4 = table('users').select('*').where('role', 'admin').orWhere('role', 'moderator');
console.log(query4.toSQL());
// 输出: { sql: 'SELECT * FROM users WHERE role = ? OR role = ?', bindings: ['admin', 'moderator'] }

// 5. WHERE IN 查询
console.log('\n5. WHERE IN 查询:');
const query5 = table('users').select('name', 'email').whereIn('id', [1, 2, 3, 4]);
console.log(query5.toSQL());
// 输出: { sql: 'SELECT name, email FROM users WHERE id IN (?, ?, ?, ?)', bindings: [1, 2, 3, 4] }

// 6. LIKE 查询
console.log('\n6. LIKE 查询:');
const query6 = table('users').select('*').whereLike('name', '%john%');
console.log(query6.toSQL());
// 输出: { sql: 'SELECT * FROM users WHERE name LIKE ?', bindings: ['%john%'] }

// 7. BETWEEN 查询
console.log('\n7. BETWEEN 查询:');
const query7 = table('orders').select('*').whereBetween('created_at', ['2024-01-01', '2024-12-31']);
console.log(query7.toSQL());
// 输出: { sql: 'SELECT * FROM orders WHERE created_at BETWEEN ? AND ?', bindings: ['2024-01-01', '2024-12-31'] }

// 8. NULL 查询
console.log('\n8. NULL 查询:');
const query8 = table('users').select('*').whereNull('deleted_at').whereNotNull('email');
console.log(query8.toSQL());
// 输出: { sql: 'SELECT * FROM users WHERE deleted_at IS NULL AND email IS NOT NULL', bindings: [] }

// 9. JOIN 查询
console.log('\n9. JOIN 查询:');
const query9 = table('users').select('users.name', 'posts.title').join('posts', 'users.id', '=', 'posts.user_id').where('users.status', 'active');
console.log(query9.toSQL());
// 输出: { sql: 'SELECT users.name, posts.title FROM users INNER JOIN posts ON users.id = posts.user_id WHERE users.status = ?', bindings: ['active'] }

// 10. LEFT JOIN 查询
console.log('\n10. LEFT JOIN 查询:');
const query10 = table('users').select('users.name', 'profiles.bio').leftJoin('profiles', 'users.id', '=', 'profiles.user_id');
console.log(query10.toSQL());
// 输出: { sql: 'SELECT users.name, profiles.bio FROM users LEFT JOIN profiles ON users.id = profiles.user_id', bindings: [] }

// 11. ORDER BY 查询
console.log('\n11. ORDER BY 查询:');
const query11 = table('users').select('*').orderBy('name', 'ASC').orderBy('created_at', 'DESC');
console.log(query11.toSQL());
// 输出: { sql: 'SELECT * FROM users ORDER BY name ASC, created_at DESC', bindings: [] }

// 12. 数组语法 ORDER BY
console.log('\n12. 数组语法 ORDER BY:');
const query12 = table('users')
    .select('*')
    .orderBy(['name', { column: 'age', order: 'desc' }]);
console.log(query12.toSQL());
// 输出: { sql: 'SELECT * FROM users ORDER BY name ASC, age DESC', bindings: [] }

// 13. GROUP BY 和 HAVING
console.log('\n13. GROUP BY 和 HAVING:');
const query13 = table('orders').select('user_id').count('id').groupBy('user_id').having('count', '>', 5);
console.log(query13.toSQL());
// 输出: { sql: 'SELECT COUNT(id) as count FROM orders GROUP BY user_id HAVING count > ?', bindings: [5] }

// 14. LIMIT 和 OFFSET
console.log('\n14. LIMIT 和 OFFSET:');
const query14 = table('users').select('*').orderBy('id').limit(10).offset(20);
console.log(query14.toSQL());
// 输出: { sql: 'SELECT * FROM users ORDER BY id ASC LIMIT 10 OFFSET 20', bindings: [] }

// 15. 聚合函数
console.log('\n15. 聚合函数:');
const query15a = table('users').count('id');
const query15b = table('orders').sum('amount');
const query15c = table('products').avg('price');
const query15d = table('users').max('age');
const query15e = table('users').min('age');

console.log('COUNT:', query15a.toSQL());
console.log('SUM:', query15b.toSQL());
console.log('AVG:', query15c.toSQL());
console.log('MAX:', query15d.toSQL());
console.log('MIN:', query15e.toSQL());

// 16. 获取第一条记录
console.log('\n16. 获取第一条记录:');
const query16 = table('users').select('*').where('email', 'john@example.com').first();
console.log(query16.toSQL());
// 输出: { sql: 'SELECT * FROM users WHERE email = ? LIMIT 1', bindings: ['john@example.com'] }

// 17. INSERT 查询
console.log('\n17. INSERT 查询:');
const query17 = table('users').insert({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25
});
console.log(query17.toSQL());
// 输出: { sql: 'INSERT INTO users (name, email, age) VALUES (?, ?, ?)', bindings: ['John Doe', 'john@example.com', 25] }

// 18. UPDATE 查询
console.log('\n18. UPDATE 查询:');
const query18 = table('users').where('id', 1).update({
    name: 'Jane Doe',
    email: 'jane@example.com'
});
console.log(query18.toSQL());
// 输出: { sql: 'UPDATE users SET name = ?, email = ? WHERE id = ?', bindings: ['Jane Doe', 'jane@example.com', 1] }

// 19. DELETE 查询
console.log('\n19. DELETE 查询:');
const query19 = table('users').where('status', 'inactive').delete();
console.log(query19.toSQL());
// 输出: { sql: 'DELETE FROM users WHERE status = ?', bindings: ['inactive'] }

// 20. 复杂查询示例
console.log('\n20. 复杂查询示例:');
const query20 = table('orders').select('users.name', 'orders.total', 'products.title').join('users', 'orders.user_id', '=', 'users.id').join('order_items', 'orders.id', '=', 'order_items.order_id').join('products', 'order_items.product_id', '=', 'products.id').where('orders.status', 'completed').where('orders.total', '>', 100).whereIn('users.role', ['customer', 'vip']).orderBy('orders.created_at', 'DESC').limit(50);
console.log(query20.toSQL());

// 21. 原始 SQL 查询
console.log('\n21. 原始 SQL 查询:');
const sql = createSQL();
const rawQuery = sql.raw('SELECT * FROM users WHERE age > ? AND status = ?', [18, 'active']);
console.log(rawQuery);
// 输出: { sql: 'SELECT * FROM users WHERE age > ? AND status = ?', bindings: [18, 'active'], isRaw: true }

console.log('\n✅ 所有示例运行完成！');

// ============= 实际使用示例 (需要数据库连接) =============

/**
 * 在实际项目中的使用示例
 */
async function exampleUsage() {
    // 假设已有 Bun SQLite 数据库连接
    // const Database = require('bun:sqlite');
    // const db = new Database('./database.db');

    const sql = createSQL(/* db */);

    try {
        // 查询用户
        const users = await sql.execute(table('users').select('*').where('status', 'active').orderBy('created_at', 'DESC').limit(10));

        // 获取单个用户
        const user = await sql.first(table('users').select('*').where('email', 'john@example.com'));

        // 事务示例
        await sql.transaction(async (trx) => {
            // 插入用户
            await trx.execute(
                table('users').insert({
                    name: 'New User',
                    email: 'new@example.com'
                })
            );

            // 更新计数
            await trx.execute(table('stats').where('key', 'user_count').update({ value: 'value + 1' }));
        });
    } catch (error) {
        console.error('数据库操作失败:', error);
    }
}

export { exampleUsage };
