import type { KeyValue } from '@/types/KeyValue.js';
import type { PostId } from '@shared/models/generated/Post.js';
import type { UserId } from '@shared/models/generated/User.js';
import { UserProfileColumns, type UserProfile, type UserProfileId, type UserProfileInitializer, type UserProfileMutator } from '@shared/models/generated/UserProfile.js';
import { type OrderDirection } from '@shared/types/OrderDirection.js';
import { BaseRepository } from './BaseRepository.js';

type FindParams = {
    id?: UserProfileId;
    ids?: UserProfileId[];
    post_id?: PostId;
    user_id?: UserId;
    user_ids?: UserId[];
    limit?: number;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
}

export class UserProfileRepository extends BaseRepository<UserProfile> {
    async find<P extends KeyValue>(params: P) {
        const { id, ids, user_id, user_ids, order_by, order_dir, limit } = params as FindParams;
        const filters: string[] = [];
        const values: unknown[] = [];

        //where
        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        ids && filters.push(`id = any($${filters.length + 1})`) && values.push(ids);
        user_id && filters.push(`user_id = $${filters.length + 1}`) && values.push(user_id);
        user_ids && filters.push(`user_id = any($${filters.length + 1})`) && values.push(user_ids);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        let filter = filters.join(' and ');
        filter = filter ? `where ${filter}` : '';

        //order by params
        const orderByParams = order_by
            ? {
                allowedOrderColumns: ['created_at'],
                order_by,
                order_dir
            }
            : null;

        //get and return result
        return this.getFindResult('user_profiles', filter, orderByParams, values, params);
    }

    async findById(id: UserProfileId): Promise<UserProfile | null> {
        return (await this.find({ id }))[0] || null;
    }

    async create(item: UserProfileInitializer): Promise<UserProfile> {
        const validColumns = new Set(UserProfileColumns as readonly string[]);
        const entries = Object.entries(item).filter(([key, value]) => validColumns.has(key) && value !== undefined && key != 'id');
        const columns = entries.map(([key]) => key).join(', ');
        const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ');
        const values = entries.map(([_, value]) => value);

        const sql = `insert into user_profiles (${columns})
                     values (${placeholders})
                     returning *`;
        const result = await this.query(sql, values);

        if (!result.rows[0]) {
            throw new Error(`Record creation failed`);
        }

        return result.rows[0];
    }

    async update(id: UserProfileId | UserProfileId[], data: UserProfileMutator): Promise<UserProfile[]> {
        const validColumns = new Set(UserProfileColumns as readonly string[]);
        const entries = Object.entries(data).filter(([key, value]) => validColumns.has(key) && value !== undefined && key != 'id');
        const set: string[] = [];
        const values: unknown[] = [];

        entries.forEach(([key, value]) => {
            set.push(`${key} = $${values.length + 1}`);
            values.push(value);
        });

        if (set.length == 0) {
            throw new Error('Update set missing');
        }
        set.push(`updated_at = now()`);

        const filters: string[] = [];
        !Array.isArray(id) && id.trim() && filters.push(`id = $${values.length + 1}`) && values.push(id.trim());
        Array.isArray(id) && filters.push(`id = any($${values.length + 1})`) && values.push(id.map(i => i.trim()));
        //user_id?.trim() && filters.push(`user_id = $${values.length + 1}`) && values.push(user_id.trim());

        if (filters.length == 0) {
            throw new Error('Update condition missing');
        }

        const where = filters.join(' and ');

        const sql = `update user_profiles
                     set ${set.join(', ')}
                     where ${where}
                     returning *`;

        const result = await this.query(sql, values);

        return result.rows;
    }

    async delete(id: UserProfileId): Promise<UserProfile> {
        if (!id) throw new Error('Missing parameter: id');

        const sql = `delete
                    from user_profiles
                    where id = $1
                    returning *`;
        const result = await this.query(sql, [id]);
        if (!result.rows[0]) throw new Error(`Delete failed`);

        return result.rows[0];
    }
}