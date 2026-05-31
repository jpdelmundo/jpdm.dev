import type { KeyValue } from '@/types/KeyValue.js';
import { UserColumns, type User, type UserId, type UserInitializer, type UserMutator } from '@shared/models/generated/User.js';
import type { OrderDirection } from '@shared/types/OrderDirection.js';
import { BaseRepository } from './BaseRepository.js';

type FindParams = {
    id?: UserId;
    ids?: UserId[];
    username?: string;
    email?: string;
    name?: string;
    vanity_id?: string;
    email_confirmed?: boolean;
    facebook_id?: string;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
}

type SearchParams = {
    username?: string;
    email?: string;
    last_name?: string;
    first_name?: string;
    name?: string;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
}

export class UserRepository extends BaseRepository<User> {
    async find<P extends KeyValue>(params: P) {
        const { id, ids, username, email, vanity_id, email_confirmed, facebook_id, order_by, order_dir } = params as FindParams;
        const filters: string[] = [];
        const values: unknown[] = [];

        //where
        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        ids && filters.push(`id = any($${filters.length + 1})`) && values.push(ids);
        username && filters.push(`username = $${filters.length + 1}`) && values.push(username);
        email && filters.push(`email = $${filters.length + 1}`) && values.push(email);
        vanity_id && filters.push(`vanity_id = $${filters.length + 1}`) && values.push(vanity_id);
        email_confirmed && filters.push(`email_confirmed = $${filters.length + 1}`) && values.push(email_confirmed);
        facebook_id && filters.push(`facebook_id = $${filters.length + 1}`) && values.push(facebook_id);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        let filter = filters.join(' and ');
        filter = filter ? `where ${filter}` : '';

        type Column = (typeof UserColumns[number]);
        const orderByParams = order_by ? {
            allowedOrderColumns: ['created_at', 'email', 'username'] as Column[],
            order_by,
            order_dir,
        } : null;

        return this.getFindResult('users', filter, orderByParams, values, params);
    }

    async findById(id: string): Promise<User | null> {
        const result = await this.find({ id });
        return result[0] || null;
    }

    async create(item: UserInitializer): Promise<User> {
        const validColumns = new Set(UserColumns as readonly string[]);
        const entries = Object.entries(item).filter(([key, value]) => validColumns.has(key) && value != undefined && key != 'id');
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

    async update(id: UserId | UserId[], item: UserMutator): Promise<User[]> {
        const validColumns = new Set(UserColumns as readonly string[]);
        const entries = Object.entries(item).filter(([key, value]) => validColumns.has(key) && value !== undefined && key != 'id');
        const set: string[] = [];
        const values: unknown[] = [];

        entries.forEach(([key, value], index) => {
            set.push(`${key} = $${values.length + 1}`);
            values.push(value);
        });

        if (set.length == 0) throw new Error('Update set missing');

        set.push(`updated_at = now()`);

        const where: string[] = [];
        !Array.isArray(id) && id.trim() && where.push(`id = $${values.length + 1}`) && values.push(id.trim());
        Array.isArray(id) && where.push(`id = any($${values.length + 1})`) && values.push(id.map(i => i.trim()));

        if (where.length == 0) throw new Error('Update condition missing');

        const sql = `update users
                     set ${set.join(', ')}
                     where ${where.join(' and ')}
                     returning *`;

        const result = await this.query(sql, values);

        return result.rows;
    }

    async delete(id: UserId, options: Record<string, unknown> = {}): Promise<User> {
        if (!id) throw new Error('Missing parameter: id');
        const permanent = !!options.permanent;

        //TODO if permanent = true, delete dependents as well
        const sql = permanent
            ? `delete from users where id = $1 returning *`
            : `update users set deleted = true, deleted_at = now() where id = $1 returning *`;

        const result = await this.query(sql, [id]);
        if (!result.rows[0]) throw new Error(`Delete failed. id: ${id}`);

        return result.rows[0];
    }

    async search<P extends KeyValue>(params: P) {
        const { username, email, first_name, last_name, name, order_by, order_dir } = params as SearchParams;
        const filters: string[] = [];
        const values: unknown[] = [];

        //where
        username && filters.push(`username ilike $${filters.length + 1}`) && values.push(`%${username}%`);
        email && filters.push(`email ilike $${filters.length + 1}`) && values.push(`%${email}%`);
        first_name && filters.push(`exists (
                                    select 1 from user_profiles up
                                    where up.user_id = users.id
                                    and up.first_name ilike $${values.length + 1}
                                )`) && values.push(`%${first_name}%`);
        last_name && filters.push(`exists (
                                    select 1 from user_profiles up
                                    where up.user_id = users.id
                                    and up.last_name ilike $${values.length + 1}
                                )`) && values.push(`%${last_name}%`);
        name && filters.push(`username ilike $${values.length + 1}
                              or exists (
                                select 1 from user_profiles up
                                where up.user_id = users.id
                                and (
                                    up.first_name ilike $${values.length + 1}
                                    or up.last_name ilike $${values.length + 1}
                                    or concat_ws(' ', up.first_name, up.last_name) ilike $${values.length + 1}
                                )
                              )`) && values.push(`%${name}%`);

        let filter = filters.join(' and ');
        filter = filter ? `where ${filter}` : '';

        type Column = (typeof UserColumns[number]);
        const orderByParams = order_by ? {
            allowedOrderColumns: ['created_at', 'email', 'username', 'last_name', 'first_name'] as Column[],
            order_by,
            order_dir,
            customOrderBy: {
                first_name: "(select lower(up.first_name) from user_profiles up where up.user_id = users.id)",
                last_name: "(select lower(up.last_name) from user_profiles up where up.user_id = users.id)",
            }
        } : null;

        return this.getFindResult('users', filter, orderByParams, values, params);
    }
}