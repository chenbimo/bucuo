/**
 * Bunfly SQL 查询构造器 - 简化版 Knex.js 风格
 * 基于 Bun 原生 SQLite，支持链式调用和基础 SQL 构造
 */

class QueryBuilder {
    constructor(tableName = null) {
        this.reset();
        if (tableName) {
            this._table = tableName;
        }
    }

    /**
     * 重置查询状态
     */
    reset() {
        this._table = null;
        this._select = [];
        this._where = [];
        this._joins = [];
        this._orderBy = [];
        this._groupBy = [];
        this._having = [];
        this._limit = null;
        this._offset = null;
        this._insert = null;
        this._update = null;
        this._delete = false;
        this._bindings = [];
        return this;
    }

    /**
     * 指定查询表
     */
    table(tableName) {
        this._table = tableName;
        return this;
    }

    /**
     * 选择字段
     */
    select(...columns) {
        if (columns.length === 0) {
            this._select = ['*'];
        } else if (columns.length === 1 && Array.isArray(columns[0])) {
            this._select = columns[0];
        } else {
            this._select = columns;
        }
        return this;
    }

    /**
     * WHERE 条件
     */
    where(column, operator = null, value = null) {
        if (typeof column === 'object') {
            // 对象语法: { name: 'John', age: 25 }
            for (const [key, val] of Object.entries(column)) {
                this._where.push({
                    type: 'AND',
                    column: key,
                    operator: '=',
                    value: val
                });
                this._bindings.push(val);
            }
        } else if (operator === null && value === null) {
            // 单参数: where('id', 1)
            this._where.push({
                type: 'AND',
                column: column,
                operator: '=',
                value: operator
            });
            this._bindings.push(operator);
        } else if (value === null) {
            // 两参数: where('id', 1)
            this._where.push({
                type: 'AND',
                column: column,
                operator: '=',
                value: operator
            });
            this._bindings.push(operator);
        } else {
            // 三参数: where('age', '>', 18)
            this._where.push({
                type: 'AND',
                column: column,
                operator: operator,
                value: value
            });
            this._bindings.push(value);
        }
        return this;
    }

    /**
     * OR WHERE 条件
     */
    orWhere(column, operator = null, value = null) {
        const originalLength = this._where.length;
        this.where(column, operator, value);

        // 修改最后添加的条件类型为 OR
        if (this._where.length > originalLength) {
            this._where[this._where.length - 1].type = 'OR';
        }
        return this;
    }

    /**
     * WHERE IN 条件
     */
    whereIn(column, values) {
        if (!Array.isArray(values)) {
            values = [values];
        }

        this._where.push({
            type: 'AND',
            column: column,
            operator: 'IN',
            value: values
        });
        this._bindings.push(...values);
        return this;
    }

    /**
     * WHERE NOT IN 条件
     */
    whereNotIn(column, values) {
        if (!Array.isArray(values)) {
            values = [values];
        }

        this._where.push({
            type: 'AND',
            column: column,
            operator: 'NOT IN',
            value: values
        });
        this._bindings.push(...values);
        return this;
    }

    /**
     * WHERE NULL 条件
     */
    whereNull(column) {
        this._where.push({
            type: 'AND',
            column: column,
            operator: 'IS NULL',
            value: null
        });
        return this;
    }

    /**
     * WHERE NOT NULL 条件
     */
    whereNotNull(column) {
        this._where.push({
            type: 'AND',
            column: column,
            operator: 'IS NOT NULL',
            value: null
        });
        return this;
    }

    /**
     * WHERE BETWEEN 条件
     */
    whereBetween(column, range) {
        if (!Array.isArray(range) || range.length !== 2) {
            throw new Error('whereBetween 需要包含两个值的数组');
        }

        this._where.push({
            type: 'AND',
            column: column,
            operator: 'BETWEEN',
            value: range
        });
        this._bindings.push(...range);
        return this;
    }

    /**
     * WHERE LIKE 条件
     */
    whereLike(column, pattern) {
        this._where.push({
            type: 'AND',
            column: column,
            operator: 'LIKE',
            value: pattern
        });
        this._bindings.push(pattern);
        return this;
    }

    /**
     * JOIN 连接
     */
    join(table, first, operator = null, second = null) {
        if (operator === null && second === null) {
            // 简化语法: join('users', 'posts.user_id', 'users.id')
            const parts = first.split('.');
            if (parts.length === 2) {
                second = parts[1];
                first = parts[0];
                operator = '=';
            }
        }

        this._joins.push({
            type: 'INNER',
            table: table,
            first: first,
            operator: operator || '=',
            second: second
        });
        return this;
    }

    /**
     * LEFT JOIN 连接
     */
    leftJoin(table, first, operator = null, second = null) {
        this.join(table, first, operator, second);
        this._joins[this._joins.length - 1].type = 'LEFT';
        return this;
    }

    /**
     * RIGHT JOIN 连接
     */
    rightJoin(table, first, operator = null, second = null) {
        this.join(table, first, operator, second);
        this._joins[this._joins.length - 1].type = 'RIGHT';
        return this;
    }

    /**
     * ORDER BY 排序
     */
    orderBy(column, direction = 'ASC') {
        if (Array.isArray(column)) {
            column.forEach((item) => {
                if (typeof item === 'string') {
                    this._orderBy.push({ column: item, direction: 'ASC' });
                } else if (typeof item === 'object') {
                    this._orderBy.push({
                        column: item.column,
                        direction: (item.order || 'ASC').toUpperCase()
                    });
                }
            });
        } else {
            this._orderBy.push({
                column: column,
                direction: direction.toUpperCase()
            });
        }
        return this;
    }

    /**
     * GROUP BY 分组
     */
    groupBy(...columns) {
        this._groupBy = this._groupBy.concat(columns);
        return this;
    }

    /**
     * HAVING 条件
     */
    having(column, operator, value) {
        this._having.push({
            column: column,
            operator: operator,
            value: value
        });
        this._bindings.push(value);
        return this;
    }

    /**
     * LIMIT 限制
     */
    limit(count) {
        this._limit = count;
        return this;
    }

    /**
     * OFFSET 偏移
     */
    offset(count) {
        this._offset = count;
        return this;
    }

    /**
     * 插入数据
     */
    insert(data) {
        if (Array.isArray(data)) {
            this._insert = data;
        } else {
            this._insert = [data];
        }
        return this;
    }

    /**
     * 更新数据
     */
    update(data) {
        this._update = data;
        return this;
    }

    /**
     * 删除数据
     */
    delete() {
        this._delete = true;
        return this;
    }

    /**
     * 构建 SELECT 查询
     */
    buildSelect() {
        if (!this._table) {
            throw new Error('必须指定查询表名');
        }

        let sql = 'SELECT ';

        // SELECT 字段
        if (this._select.length === 0) {
            sql += '*';
        } else {
            sql += this._select.join(', ');
        }

        // FROM 表名
        sql += ` FROM ${this._table}`;

        // JOIN 连接
        if (this._joins.length > 0) {
            for (const join of this._joins) {
                sql += ` ${join.type} JOIN ${join.table} ON ${join.first} ${join.operator} ${join.second}`;
            }
        }

        // WHERE 条件
        if (this._where.length > 0) {
            sql += ' WHERE ';
            const conditions = this._where.map((condition, index) => {
                let clause = '';

                if (index > 0) {
                    clause += ` ${condition.type} `;
                }

                if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
                    const placeholders = Array(condition.value.length).fill('?').join(', ');
                    clause += `${condition.column} ${condition.operator} (${placeholders})`;
                } else if (condition.operator === 'BETWEEN') {
                    clause += `${condition.column} BETWEEN ? AND ?`;
                } else if (condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL') {
                    clause += `${condition.column} ${condition.operator}`;
                } else {
                    clause += `${condition.column} ${condition.operator} ?`;
                }

                return clause;
            });
            sql += conditions.join('');
        }

        // GROUP BY 分组
        if (this._groupBy.length > 0) {
            sql += ` GROUP BY ${this._groupBy.join(', ')}`;
        }

        // HAVING 条件
        if (this._having.length > 0) {
            const havingConditions = this._having.map((h) => `${h.column} ${h.operator} ?`);
            sql += ` HAVING ${havingConditions.join(' AND ')}`;
        }

        // ORDER BY 排序
        if (this._orderBy.length > 0) {
            const orderClauses = this._orderBy.map((order) => `${order.column} ${order.direction}`);
            sql += ` ORDER BY ${orderClauses.join(', ')}`;
        }

        // LIMIT 和 OFFSET
        if (this._limit !== null) {
            sql += ` LIMIT ${this._limit}`;
        }

        if (this._offset !== null) {
            sql += ` OFFSET ${this._offset}`;
        }

        return { sql, bindings: this._bindings };
    }

    /**
     * 构建 INSERT 查询
     */
    buildInsert() {
        if (!this._table || !this._insert) {
            throw new Error('INSERT 需要指定表名和数据');
        }

        const data = this._insert[0];
        const columns = Object.keys(data);
        const values = Object.values(data);

        const placeholders = Array(columns.length).fill('?').join(', ');
        const sql = `INSERT INTO ${this._table} (${columns.join(', ')}) VALUES (${placeholders})`;

        return { sql, bindings: values };
    }

    /**
     * 构建 UPDATE 查询
     */
    buildUpdate() {
        if (!this._table || !this._update) {
            throw new Error('UPDATE 需要指定表名和数据');
        }

        const columns = Object.keys(this._update);
        const values = Object.values(this._update);

        const setClauses = columns.map((col) => `${col} = ?`);
        let sql = `UPDATE ${this._table} SET ${setClauses.join(', ')}`;

        const bindings = [...values];

        // WHERE 条件
        if (this._where.length > 0) {
            sql += ' WHERE ';
            const conditions = this._where.map((condition, index) => {
                let clause = '';

                if (index > 0) {
                    clause += ` ${condition.type} `;
                }

                clause += `${condition.column} ${condition.operator} ?`;
                return clause;
            });
            sql += conditions.join('');
            bindings.push(...this._bindings);
        }

        return { sql, bindings };
    }

    /**
     * 构建 DELETE 查询
     */
    buildDelete() {
        if (!this._table) {
            throw new Error('DELETE 需要指定表名');
        }

        let sql = `DELETE FROM ${this._table}`;
        const bindings = [...this._bindings];

        // WHERE 条件
        if (this._where.length > 0) {
            sql += ' WHERE ';
            const conditions = this._where.map((condition, index) => {
                let clause = '';

                if (index > 0) {
                    clause += ` ${condition.type} `;
                }

                clause += `${condition.column} ${condition.operator} ?`;
                return clause;
            });
            sql += conditions.join('');
        }

        return { sql, bindings };
    }

    /**
     * 生成最终 SQL
     */
    toSQL() {
        if (this._insert) {
            return this.buildInsert();
        } else if (this._update) {
            return this.buildUpdate();
        } else if (this._delete) {
            return this.buildDelete();
        } else {
            return this.buildSelect();
        }
    }

    /**
     * 获取第一条记录
     */
    first() {
        this.limit(1);
        return this;
    }

    /**
     * 计数查询
     */
    count(column = '*') {
        this._select = [`COUNT(${column}) as count`];
        return this;
    }

    /**
     * 最大值
     */
    max(column) {
        this._select = [`MAX(${column}) as max`];
        return this;
    }

    /**
     * 最小值
     */
    min(column) {
        this._select = [`MIN(${column}) as min`];
        return this;
    }

    /**
     * 平均值
     */
    avg(column) {
        this._select = [`AVG(${column}) as avg`];
        return this;
    }

    /**
     * 求和
     */
    sum(column) {
        this._select = [`SUM(${column}) as sum`];
        return this;
    }

    /**
     * 克隆查询构造器
     */
    clone() {
        const cloned = new QueryBuilder();
        cloned._table = this._table;
        cloned._select = [...this._select];
        cloned._where = [...this._where];
        cloned._joins = [...this._joins];
        cloned._orderBy = [...this._orderBy];
        cloned._groupBy = [...this._groupBy];
        cloned._having = [...this._having];
        cloned._limit = this._limit;
        cloned._offset = this._offset;
        cloned._insert = this._insert ? [...this._insert] : null;
        cloned._update = this._update ? { ...this._update } : null;
        cloned._delete = this._delete;
        cloned._bindings = [...this._bindings];
        return cloned;
    }
}

/**
 * SQL 查询构造器主类
 */
class SQL {
    constructor(database = null) {
        this.database = database;
    }

    /**
     * 创建查询构造器
     */
    table(tableName) {
        return new QueryBuilder(tableName);
    }

    /**
     * SELECT 查询
     */
    select(...columns) {
        return new QueryBuilder().select(...columns);
    }

    /**
     * 原始 SQL 查询
     */
    raw(sql, bindings = []) {
        return {
            sql,
            bindings: Array.isArray(bindings) ? bindings : [bindings],
            isRaw: true
        };
    }

    /**
     * 执行查询（需要传入数据库连接）
     */
    async execute(query, database = null) {
        const db = database || this.database;
        if (!db) {
            throw new Error('需要提供数据库连接');
        }

        const { sql, bindings = [] } = query.isRaw ? query : query.toSQL();

        try {
            // 使用 Bun 的 SQLite
            if (typeof db.query === 'function') {
                return db.query(sql).all(...bindings);
            } else if (typeof db.prepare === 'function') {
                const stmt = db.prepare(sql);
                return stmt.all(...bindings);
            } else {
                throw new Error('不支持的数据库类型');
            }
        } catch (error) {
            console.error('SQL 执行错误:', { sql, bindings, error: error.message });
            throw error;
        }
    }

    /**
     * 执行并获取第一条记录
     */
    async first(query, database = null) {
        const results = await this.execute(query, database);
        return results[0] || null;
    }

    /**
     * 简化的事务支持
     */
    async transaction(callback, database = null) {
        const db = database || this.database;
        if (!db) {
            throw new Error('需要提供数据库连接');
        }

        try {
            await this.execute(this.raw('BEGIN TRANSACTION'), db);
            const result = await callback(this);
            await this.execute(this.raw('COMMIT'), db);
            return result;
        } catch (error) {
            await this.execute(this.raw('ROLLBACK'), db);
            throw error;
        }
    }
}

// 便捷的工厂函数
function createSQL(database = null) {
    return new SQL(database);
}

// 便捷的查询构造器函数
function table(tableName) {
    return new QueryBuilder(tableName);
}

export { SQL, QueryBuilder, createSQL, table };

export default createSQL;
