import type { Pool, PoolClient } from "pg";
import { pool as defaultPool } from "./db";

export async function withTransaction<T>(fn: (tx: PoolClient) => Promise<T>, pool?: Pool): Promise<T> {
    const usedPool = pool ?? defaultPool;
    const client = await usedPool.connect();
    try {
        if (process.env.SQL_LOG == '1') console.log('[SQL]', 'begin');
        await client.query('begin');
        const result = await fn(client);
        if (process.env.SQL_LOG == '1') console.log('[SQL]', 'commit');
        await client.query('commit');
        return result;
    } catch (e) {
        if (process.env.SQL_LOG == '1') console.log('[SQL]', 'rollback');
        await client.query('rollback');
        throw e;
    } finally {
        client.release();
    }
}