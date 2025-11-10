import { Pool, type QueryResultRow } from 'pg';
import { getFullQuery } from '../utils/pgHelper';

export abstract class BaseRepository<T extends QueryResultRow> {
    protected static sharedPool: Pool;
    protected pool: Pool

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

    abstract find(filter: unknown): Promise<T[] | null>;
    abstract findById(id: string): Promise<T | null>;
    abstract create(item: T): Promise<T>;
    abstract update(id: string, item: Partial<T>): Promise<T[]>;
    abstract delete(id: string): Promise<T[]>;
}