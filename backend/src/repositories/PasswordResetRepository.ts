import { getDateParamCondition } from '@/infra/pgHelper.js';
import type { FindParamsBase } from '@/types/FindParams.js';
import type { PasswordReset, PasswordResetId, PasswordResetInitializer, PasswordResetMutator } from '@shared/models/generated/PasswordReset.js';
import type { UserId } from '@shared/models/generated/User.js';
import type { DateComparison } from '@shared/types/DateComparison.js';
import { type OrderDirection } from '@shared/types/OrderDirection.js';
import { BaseRepository } from './BaseRepository.js';

type FindParams = {
    token_hash?: PasswordResetId;
    user_id?: UserId;
    used_at?: DateComparison;
    created_at?: DateComparison;
    limit?: number;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
}

export class PasswordResetRepository extends BaseRepository<PasswordReset> {
    async find<P extends FindParamsBase>(params: P) {
        const { token_hash, user_id, used_at, order_by, order_dir } = params as FindParams;
        const filters: string[] = [];
        const values: unknown[] = [];

        //where
        token_hash && filters.push(`token_hash = $${values.length + 1}`) && values.push(token_hash);
        user_id && filters.push(`user_id = $${values.length + 1}`) && values.push(user_id);
        used_at && filters.push(getDateParamCondition('used_at', used_at, values));

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
        return this.getFindResult('password_reset', filter, orderByParams, values, params);
    }

    async findById(token_hash: PasswordResetId): Promise<PasswordReset | null> {
        return (await this.find({ token_hash }))[0] || null;
    }

    async create(item: PasswordResetInitializer): Promise<PasswordReset> {
        const entries = Object.entries(item).filter(([key, value]) => value !== undefined && key != 'id');
        const columns = entries.map(([key]) => key).join(', ');
        const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ');
        const values = entries.map(([_, value]) => value);

        const sql = `insert into password_reset (${columns})
                     values (${placeholders})
                     returning *`;
        const result = await this.query(sql, values);

        if (!result.rows[0]) {
            throw new Error(`Record creation failed`);
        }

        return result.rows[0];
    }

    async update(id: PasswordResetId, data: PasswordResetMutator): Promise<PasswordReset> {
        const { user_id } = data;
        const entries = Object.entries(data).filter(([key, value]) => value !== undefined && key != 'id' && key != 'user_id');
        const set: string[] = [];
        const values: unknown[] = [];

        entries.forEach(([key, value]) => {
            set.push(`${key} = $${values.length + 1}`);
            values.push(value);
        });

        if (set.length == 0) {
            throw new Error('Update set missing');
        }
        //set.push(`updated_at = now()`);

        const filters: string[] = [];
        id.trim() && filters.push(`id = $${values.length + 1}`) && values.push(id.trim());
        user_id?.trim() && filters.push(`user_id = $${values.length + 1}`) && values.push(user_id.trim());

        if (filters.length == 0) {
            throw new Error('Update condition missing');
        }

        let where = filters.join(' and ');
        where = where ? `where ${where}` : '';

        const sql = `update password_reset
                     set ${set.join(', ')}
                     ${where}
                     returning *`;

        const result = await this.query(sql, values);
        if (!result.rows[0]) throw new Error(`Update failed`);

        return result.rows[0];
    }

    async delete(id: PasswordResetId): Promise<PasswordReset> {
        if (!id) throw new Error('Missing parameter: id');

        const sql = `delete
                    from password_reset
                    where id = $1
                    returning *`;
        const result = await this.query(sql, [id]);
        if (!result.rows[0]) throw new Error(`Delete failed`);

        return result.rows[0];
    }
}