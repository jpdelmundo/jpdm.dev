import './env.js';
//
import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./infra/db.js";

const MIGRATIONS_DIR = fileURLToPath(new URL('../migrations', import.meta.url));

async function migrate() {
    const client = await pool.connect();

    try {
        console.log('Starting migrations...');

        // Test the connection
        const { rows } = await client.query('SELECT current_database(), version()');
        console.log('Connected to database:', rows[0].current_database);

        // Create migrations table if not exists with better error handling
        console.log('Creating migrations table if not exists...');
        try {
            await client.query(`
                create table if not exists migrations (
                    id serial primary key,
                    name varchar(255) not null unique,
                    applied_at timestamp with time zone default now()
                )
            `);
            console.log('Migrations table created/verified');
        } catch (error) {
            console.error('Failed to create migrations table:', error);
            throw error;
        }

        // Verify the table exists and is accessible
        try {
            const { rows: tables } = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name = 'migrations'
            `);

            if (tables.length === 0) {
                throw new Error('Migrations table was not created successfully');
            }
            console.log('Migrations table verified in information_schema');
        } catch (error) {
            console.error('Failed to verify migrations table:', error);
            throw error;
        }

        // Get applied migrations
        console.log('Checking applied migrations...');
        let applied = [];
        try {
            const result = await client.query(`
                select name from migrations order by name
            `);
            applied = result.rows;
            console.log(`Found ${applied.length} applied migrations`);
        } catch (error) {
            console.error('Failed to query migrations table:', error);
            throw error;
        }

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

            // Start a transaction for this migration
            try {
                console.log(`Starting transaction for ${file}`);
                await client.query('BEGIN');

                console.log(`Executing migration SQL for ${file}`);
                await client.query(sql);

                console.log(`Recording migration ${file} in migrations table`);
                await client.query(`
                    insert into migrations (name) values ($1)
                `, [file]);

                console.log(`Committing transaction for ${file}`);
                await client.query('COMMIT');

                console.log(`${file} applied successfully`);
            } catch (error) {
                console.log(`Rolling back transaction for ${file} due to error`);
                try {
                    await client.query('ROLLBACK');
                } catch (rollbackError) {
                    console.error('Error during rollback:', rollbackError);
                }
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
        console.log('Releasing client');
        client.release();
        await pool.end();
    }
}

migrate().catch(console.error);