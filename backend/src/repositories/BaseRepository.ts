import { pool as sharedPool } from '@/infra/db.js';
import { getFullQuery } from '@/infra/pgHelper.js';
import type { Db } from '@/types/Db.js';
import type { InferFindResultType } from '@/types/InferFindResultType.js';
import type { KeyValue, KeyValueWithPagination } from '@/types/KeyValue.js';
import { OrderDirection } from '@shared/types/OrderDirection.js';
import { isNumber } from '@shared/utils/validation.js';
import { type QueryResultRow } from 'pg';

export interface GetOrderByParams {
    allowedOrderColumns: string[];
    order_by: string;
    order_dir: OrderDirection | undefined;
    prioritize_user_id?: number,
    customOrderBy?: KeyValue
}

export abstract class BaseRepository<T extends QueryResultRow> {
    protected db: Db;

    constructor(db?: Db) {
        this.db = db ?? sharedPool;
    }

    query<R extends QueryResultRow = T>(queryText: string, values?: unknown[]) {
        console.debug({ queryText, values });
        if (process.env.LOG_SQL == '1') console.log('[SQL]', getFullQuery(queryText, values));
        return this.db.query<R>(queryText, values);
    }

    protected async getFindResult<P extends KeyValue>(tableName: string, filter: string, orderByParams: GetOrderByParams | null, values: unknown[], params: P) {
        return ('page_num' in params || 'page_size' in params)
            ? this.getFindResultPaginated(tableName, filter, orderByParams, values, params)
            : this.getFindResultArray(tableName, filter, orderByParams, values, params);
    }

    protected async getFindResultPaginated<P extends KeyValue>(tableName: string, filter: string, orderByParams: GetOrderByParams | null, values: unknown[], params: P) {
        const totalResult = await this.query<{ total: number }>(`select count(*) total
                                                                from ${tableName}
                                                                ${filter}`, values);
        //order
        const order = orderByParams ? this.getOrderBy(orderByParams, values) : '';

        //limit (pagination)
        const { page_num, page_size } = params as KeyValueWithPagination;
        const pageNum = Math.min(Math.abs(Number(page_num)) || 1, 1000);
        const pageSize = Math.min(Math.abs(Number(page_size)) || 30, 30);
        let limit = `limit $${values.length + 1}`;
        values.push(pageSize);
        limit = `${limit} offset $${values.length + 1}`;
        values.push((pageNum - 1) * pageSize);

        const paginatedResult = await this.query(`select *
                                                from ${tableName}
                                                ${filter}
                                                ${order}
                                                ${limit}`, values);

        return {
            page_items: paginatedResult.rows,
            total: Number(totalResult.rows[0]?.total) || 0,
            page_num: pageNum,
            page_size: pageSize
        } as InferFindResultType<P, T>;
    }

    protected async getFindResultArray<P extends KeyValue>(tableName: string, filter: string, orderByParams: GetOrderByParams | null, values: unknown[], params?: P) { //params is needed here for TS to infer type
        const order = orderByParams ? this.getOrderBy(orderByParams, values) : '';
        const limit = params?.limit && isNumber(params.limit) ? `limit ${params.limit}` : '';
        const result = await this.query(`select *
                                        from ${tableName}
                                        ${filter}
                                        ${order}
                                        ${limit}`, values);
        return result.rows as InferFindResultType<P, T>;
    }

    protected getOrderBy(params: GetOrderByParams, values: unknown[]) {
        const { allowedOrderColumns, order_by, order_dir, prioritize_user_id, customOrderBy } = params;
        let order = '';
        const orderByExpr = customOrderBy?.[order_by];
        const effectiveOrderBy = orderByExpr ?? order_by;

        if (orderByExpr || allowedOrderColumns.includes(order_by)) {
            const dir = order_dir && Object.values(OrderDirection).includes(order_dir) ? order_dir : 'asc';
            let priority = '';
            if (values && prioritize_user_id) {
                priority = `case when user_id = $${values.length + 1} then 0 else 1 end,`;
                values.push(prioritize_user_id);
            }
            order = priority ? `order by ${priority} ${effectiveOrderBy} ${dir}` : `order by ${effectiveOrderBy} ${dir}`;
        }
        return order;
    }

    abstract find<P extends KeyValue>(params: P): Promise<InferFindResultType<P, T> | T[]>;
    abstract findById(id: string): Promise<T | null>;
    abstract create(data: T): Promise<T>;
    abstract update(id: string, data: Partial<T>, options?: Record<string, unknown>): Promise<T>;
    abstract delete(id: string, options?: Record<string, unknown>): Promise<T>;
}