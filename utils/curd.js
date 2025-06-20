import { sql } from 'kysely';
import { Env } from '../config/env.js';

export function Crud(db, redis) {
    // 扩展 SelectQueryBuilder
    const originalSelectFrom = db.selectFrom.bind(db);
    db.selectFrom = function (table) {
        const query = originalSelectFrom(table);

        // getDetail - 查询单条记录
        query.getDetail = async function (fields) {
            if (fields) {
                return await this.select(fields).executeTakeFirst();
            }
            return await this.selectAll().executeTakeFirst();
        };

        // getAll - 查询所有记录
        query.getAll = async function (fields) {
            if (fields) {
                return await this.select(fields).execute();
            }
            return await this.selectAll().execute();
        };

        // getList - 分页查询
        query.getList = async function (page = 1, pageSize = 10, fields) {
            const offset = (page - 1) * pageSize;

            // 构建数据查询
            let dataQuery = this;
            if (fields) {
                dataQuery = dataQuery.select(fields);
            } else {
                dataQuery = dataQuery.selectAll();
            }
            dataQuery = dataQuery.limit(pageSize).offset(offset);

            // 构建计数查询 - 复用查询条件但清除不必要的部分
            let countQuery = this.clearSelect()
                .clearOrderBy()
                .clearLimit()
                .clearOffset()
                .select(sql`count(*)`.as('total'));

            // 并行执行查询
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

        return query;
    };

    // 扩展 InsertQueryBuilder
    const originalInsertInto = db.insertInto.bind(db);
    db.insertInto = function (table) {
        const query = originalInsertInto(table);

        // insData - 插入数据并自动添加时间戳
        query.insData = async function (data) {
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
            await this.values(data).executeTakeFirst();
            if (Array.isArray(data)) {
                return { ids: data.map((item) => item.id) };
            } else {
                return { ids: [data.id] };
            }
        };

        return query;
    };

    // 扩展 UpdateQueryBuilder
    const originalUpdateTable = db.updateTable.bind(db);
    db.updateTable = function (table) {
        const query = originalUpdateTable(table);

        // updateData - 更新数据并自动更新时间戳
        query.updData = async function (data) {
            data.updated_at = Date.now();

            return await this.set(data).execute();
        };

        return query;
    };

    // 扩展 DeleteQueryBuilder
    const originalDeleteFrom = db.deleteFrom.bind(db);
    db.deleteFrom = function (table) {
        const query = originalDeleteFrom(table);

        // deleteData - 删除数据
        query.delData = async function () {
            return await this.executeTakeFirst();
        };

        return query;
    };

    // 扩展事务支持
    const originalTransaction = db.transaction.bind(db);
    db.transaction = function () {
        const trx = originalTransaction();

        const originalExecute = trx.execute.bind(trx);
        trx.execute = async function (callback) {
            return await originalExecute(async (txDb) => {
                const extendedTxDb = extendKyselyWithCrud(txDb, {
                    createdAtField: 'created_at',
                    updatedAtField: 'updated_at'
                });
                return await callback(extendedTxDb);
            });
        };

        return trx;
    };

    return db;
}
