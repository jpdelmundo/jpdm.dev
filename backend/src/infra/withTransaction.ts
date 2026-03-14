import type { Db } from "@/types/Db.js";
import type { PoolClient } from "pg";
import { pool as defaultPool } from "./db.js";

export async function withTransaction<T>(fn: (txClient: PoolClient) => Promise<T>, db?: Db): Promise<T> {
    const isClient = db != null && 'release' in db;
    const client = isClient ? db : await (db ?? defaultPool).connect();
    try {
        if (process.env.LOG_SQL == '1') console.log('[SQL]', 'begin');
        await client.query('begin');
        const result = await fn(client);
        if (process.env.LOG_SQL == '1') console.log('[SQL]', 'commit');
        await client.query('commit');
        return result;
    } catch (e) {
        if (process.env.LOG_SQL == '1') console.log('[SQL]', 'rollback');
        await client.query('rollback');
        throw e;
    } finally {
        //only release if client acquired above, otherwise let the upstream release it
        if (!isClient) client.release();
    }
}