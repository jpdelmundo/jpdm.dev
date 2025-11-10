import type User from '@shared/models/generated/User';
import type { UserId, UserInitializer, UserMutator } from '@shared/models/generated/User';
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<User> {
    async find({ id, username, email }: { id?: string, username?: string, email?: string }): Promise<User[]> {
        const filters: string[] = [];
        const values: unknown[] = [];

        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        username && filters.push(`username = $${filters.length + 1}`) && values.push(username);
        email && filters.push(`email = $${filters.length + 1}`) && values.push(email);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        const result = await this.pool.query<User>(`select *
                                                      from users
                                                      where ${filters.join(' and ')}`, values);
        return result.rows;
    }

    async findById(id: string): Promise<User | null> {
        const result = await this.find({ id });
        return result[0] || null;
    }

    async create(item: UserInitializer): Promise<User> {
        const entries = Object.entries(item).filter(([key, value]) => value != undefined);
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

    async update(id: UserId, item: UserMutator): Promise<User[]> {
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

        return result.rows;
    }

    delete(id: UserId): Promise<User[]> {
        throw new Error("Method not implemented.")
    }
}