import type { FindParamsBase, FindParamsPaginated } from '@/types/FindParams';
import type { InferFindResultType } from '@/types/InferFindResultType';
import { OrderDirections, type OrderDirection } from '@shared/types/OrderDirection';
import { Pool, type QueryResultRow } from 'pg';
import { getFullQuery } from '../utils/pgHelper';

export abstract class BaseRepository<T extends QueryResultRow> {
    protected static sharedPool: Pool;
    protected pool: Pool;

    constructor(pool?: Pool) {
        if (pool) {
            this.pool = pool;
        } else {
            if (!BaseRepository.sharedPool) {
                BaseRepository.sharedPool = new Pool({ connectionString: process.env.DATABASE_URL });
            }
            this.pool = BaseRepository.sharedPool;
        }
    }

    query<R extends QueryResultRow = T>(queryText: string, values?: unknown[]) {
        if (process.env.NODE_ENV == 'development') console.log('[SQL]', getFullQuery(queryText, values));
        return this.pool.query<R>(queryText, values);
    }

    protected async getFindResult<P extends FindParamsBase>(tableName: string, filter: string, order: string, values: unknown[], params: P) {
        return ('page_num' in params || 'page_size' in params)
            ? this.getFindResultPaginated(tableName, filter, order, values, params)
            : this.getFindResultArray(tableName, filter, order, values, params);
    }

    protected async getFindResultPaginated<P extends FindParamsBase>(tableName: string, filter: string, order: string, values: unknown[], params: P) {
        const totalResult = await this.query<{ total: number }>(`select count(*) total
                                                                from ${tableName}
                                                                ${filter}`, values);

        const { page_num, page_size } = params as FindParamsPaginated;
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

    protected async getFindResultArray<P extends FindParamsBase>(tableName: string, filter: string, order: string, values: unknown[], params?: P) { //params is needed here for TS to infer type
        const result = await this.query(`select *
                                        from ${tableName}
                                        ${filter}
                                        ${order}`, values);
        return result.rows as InferFindResultType<P, T>;
    }

    protected getOrderBy(allowedOrderColumns: string[], order_by: string, order_dir: OrderDirection | undefined) {
        let order = '';
        if (allowedOrderColumns.includes(order_by)) {
            const dir = order_dir && OrderDirections.includes(order_dir) ? order_dir : 'asc';
            order = `order by ${order_by} ${dir}`;
        }
        return order;
    }

    abstract find(params: FindParamsBase): Promise<InferFindResultType<FindParamsBase, T>>;
    abstract findById(id: string): Promise<T | null>;
    abstract create(item: T): Promise<T>;
    abstract update(id: string, item: Partial<T>): Promise<T[]>;
    abstract delete(id: string): Promise<T[]>;
}