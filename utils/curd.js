import { sql } from 'kysely';
import { omitFields } from './util.js';

export function Crud(db, redis) {
    // 简单的便捷方法，不修改原有的 Kysely 方法

    // 插入数据
    db.insData = async function (insertQuery, data) {
        const now = Date.now();

        if (Array.isArray(data)) {
            for (let item of data) {
                item.id = await redis.genTimeID();
                item.created_at = now;
                item.updated_at = now;
            }
        } else {
            data.id = await redis.genTimeID();
            data.created_at = now;
            data.updated_at = now;
        }

        await insertQuery.values(data).executeTakeFirst();
        return Array.isArray(data) ? { ids: data.map((item) => item.id) } : { ids: [data.id] };
    };

    // 更新数据
    db.updData = async function (updateQuery, data) {
        data.updated_at = Date.now();
        const updateData = omitFields(data, ['id', 'created_at', 'deleted_at']);
        await updateQuery.set(updateData).execute();
        return {};
    };

    // 删除数据
    db.delData = async function (deleteQuery) {
        return await deleteQuery.executeTakeFirst();
    };

    // 查询单条记录
    db.getDetail = async function (selectQuery, fields) {
        if (fields) {
            return await selectQuery.select(fields).executeTakeFirst();
        }
        return await selectQuery.selectAll().executeTakeFirst();
    };

    // 分页查询 - 这个方法保持原样，因为它需要构建复杂的查询
    db.getList = async function (table, options = {}) {
        const { where = null, page = 1, pageSize = 10, fields = null, orderBy = null } = options;

        const offset = (page - 1) * pageSize;

        // 数据查询
        let dataQuery = db.selectFrom(table);
        if (fields) {
            dataQuery = dataQuery.select(fields);
        } else {
            dataQuery = dataQuery.selectAll();
        }

        // 计数查询
        let countQuery = db.selectFrom(table).select(sql`count(*)`.as('total'));

        // 添加 where 条件
        if (where) {
            if (Array.isArray(where)) {
                where.forEach((condition) => {
                    dataQuery = dataQuery.where(condition[0], condition[1], condition[2]);
                    countQuery = countQuery.where(condition[0], condition[1], condition[2]);
                });
            } else if (typeof where === 'object') {
                Object.entries(where).forEach(([key, value]) => {
                    dataQuery = dataQuery.where(key, '=', value);
                    countQuery = countQuery.where(key, '=', value);
                });
            }
        }

        // 排序和分页
        if (orderBy) {
            dataQuery = dataQuery.orderBy(orderBy[0], orderBy[1] || 'asc');
        }
        dataQuery = dataQuery.limit(pageSize).offset(offset);

        const [data, countResult] = await Promise.all([dataQuery.execute(), countQuery.executeTakeFirst()]);

        const total = Number(countResult?.total || 0);

        return {
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    };

    return db;
}
