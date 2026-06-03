import './env.js';
//
import * as bcrypt from 'bcrypt';
import { pool } from "./infra/db.js";

async function seed() {
    const seedUserUsername = process.env.SEED_USER_USERNAME;
    const seedUserPassword = process.env.SEED_USER_PASSWORD || 'password';
    if (!seedUserUsername) {
        console.log('No SEED_USER_USERNAME defined. Skipping seeding.');
        return;
    }

    const client = await pool.connect();

    try {
        console.log('Seeding DB...');

        const { rows } = await client.query('select current_database(), version()');
        console.log('Connected to database:', rows[0].current_database, rows[0].version);

        //seed user
        const { rows: users } = await client.query(
            `select id, username
            from users
            where username = 'admin'
            limit 1`
        );
        if (users.length > 0) {
            console.log(`Seed user already exists: "${users[0].username}" (${users[0].id}). Skipping.`);
            return;
        }

        const seedUserPasswordHash = await bcrypt.hash(seedUserPassword, 12);
        const queryResult = await client.query(
            `insert into users(username, password)
            values($1, $2)
            returning id, username`,
            [seedUserUsername, seedUserPasswordHash]
        );

        const seedUser = queryResult.rows[0];
        const userId = seedUser.id;

        await client.query(
            `insert into user_roles(user_id, role)
            values ($1, 'admin')`,
            [userId]
        );

        console.log(`Created seed user: "${seedUser.username}" (${seedUser.id})`);
        console.log(`⚠️  Seed user password: ${seedUserPassword}`);

        //seed post
        await client.query(
            `insert into posts(title, content, user_id)
            values ($1, $2, $3)`,
            ['Hello! 👋', 'This post was auto-generated. You can edit or delete this if you are the owner.', userId]
        );
        console.log(`Created seed post.`);

        console.log(`Seeding DB completed successfully.`);
    } catch (error) {
        console.error('Seeding DB failed!', error);
        process.exitCode = 1;
    } finally {
        console.log('Releasing client')
        client.release();
        await pool.end();
    }
}

seed();