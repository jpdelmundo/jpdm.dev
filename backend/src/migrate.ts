import './env.js';
//
import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./infra/db.js";

//console.log({ dir: fileURLToPath(new URL('../migrations', import.meta.url)) });
const MIGRATIONS_DIR = fileURLToPath(new URL('../migrations', import.meta.url));

async function migrate() {
    const client = await pool.connect();

    try {
        console.log('Starting migrations...');

        //create migrations tables if not exists
        await client.query(`
            create table if not exists migrations (
                id serial primary key,
                name varchar(255) not null unique,
                applied_at timestamp with time zone default now()
            )
        `);

        const { rows: applied } = await client.query(`
            select name from migrations order by name
        `);
        const appliedSet = new Set(applied.map(v => v.name));

        const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
        console.log(`Found ${files.length} migration files in ${MIGRATIONS_DIR}`);

        for (const file of files) {
            if (appliedSet.has(file)) {
                console.log(`${file} already applied, skipping...`);
                continue;
            }

            console.log(`Applying ${file}...`);

            const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');

            try {
                await client.query('begin');
                await client.query(sql);
                await client.query(`
                    insert into migrations (name) values ($1)
                `, [file]);
                await client.query('commit');

                console.error(`${file} applied successfully`);
            } catch (error) {
                await client.query('rollback');
                console.error(`Failed to apply ${file}`);
                console.error(error);
                throw error;
            }
        }

        console.log(`All migrations completed successfully`);
    } catch (error) {
        console.error('Migration failed!', error);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();