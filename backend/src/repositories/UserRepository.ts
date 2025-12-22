import type { User, UserId, UserInitializer, UserMutator } from '@shared/models/generated/User';
import { BaseRepository } from './BaseRepository';

type FindParams = {
    id?: string;
    username?: string;
    email?: string;
    vanity_id?: string;
    email_confirmed?: boolean;
}

export class UserRepository extends BaseRepository<User> {
    async find(params: FindParams): Promise<User[]> {
        const { id, username, email, vanity_id, email_confirmed } = params;
        const filters: string[] = [];
        const values: unknown[] = [];

        //where
        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        username && filters.push(`username = $${filters.length + 1}`) && values.push(username);
        email && filters.push(`email = $${filters.length + 1}`) && values.push(email);
        vanity_id && filters.push(`vanity_id = $${filters.length + 1}`) && values.push(vanity_id);
        email_confirmed && filters.push(`email_confirmed = $${filters.length + 1}`) && values.push(email_confirmed);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        let filter = filters.join(' and ');
        filter = filter ? `where ${filter}` : '';

        const result = await this.query<User>(`select *
                                               from users
                                               ${filter}`, values);
        return result.rows;
    }

    async findById(id: string): Promise<User | null> {
        const result = await this.find({ id });
        return result[0] || null;
    }

    async create(item: UserInitializer): Promise<User> {
        const entries = Object.entries(item).filter(([key, value]) => value != undefined && key != 'id');
        const columns = entries.map(([key]) => key).join(', ');
        const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ');
        const values = entries.map(([_, value]) => value);

        const sql = `insert into users (${columns})
                     values (${placeholders})
                     returning *`;
        const result = await this.query(sql, values);

        if (!result.rows[0]) {
            throw new Error('Record creation failed');
        }

        return result.rows[0];
    }

    async update(id: UserId, item: UserMutator): Promise<User> {
        const entries = Object.entries(item).filter(([key, value]) => value !== undefined && key != 'id');
        const set: string[] = [];
        const values: unknown[] = [];

        entries.forEach(([key, value], index) => {
            set.push(`${key} = $${values.length + 1}`);
            values.push(value);
        });

        if (set.length == 0) throw new Error('Update set missing');

        set.push(`updated_at = now()`);

        const where: string[] = [];
        id.trim() && where.push(`id = $${values.length + 1}`) && values.push(id.trim());

        if (where.length == 0) throw new Error('Update condition missing');

        const sql = `update users
                     set ${set.join(', ')}
                     where ${where.join(' and ')}
                     returning *`;

        const result = await this.query(sql, values);
        if (!result.rows[0]) throw new Error('Update failed');

        return result.rows[0];
    }

    delete(id: UserId): Promise<User> {
        throw new Error("Method not implemented.")
    }
}