import type { FindParamsBase } from '@/types/FindParams';
import type { Comment, CommentId, CommentInitializer, CommentMutator } from '@shared/models/generated/Comment';
import type { PostId } from '@shared/models/generated/Post';
import type { UserId } from '@shared/models/generated/User';
import { type OrderDirection } from '@shared/types/OrderDirection';
import { BaseRepository } from './BaseRepository';

type FindParams = {
    id?: CommentId;
    post_id?: PostId;
    user_id?: UserId;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
    prioritize_user_id?: number;
}

export class CommentRepository extends BaseRepository<Comment> {
    async find<P extends FindParamsBase>(params: P) {
        const { id, post_id, order_by, order_dir, prioritize_user_id } = params as FindParams;
        const filters: string[] = [];
        const values: unknown[] = [];

        //where
        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        post_id && filters.push(`post_id = $${filters.length + 1}`) && values.push(post_id);

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
                order_dir,
                ...(prioritize_user_id && { prioritize_user_id })
            }
            : null;

        //get and return result
        return this.getFindResult('comments', filter, orderByParams, values, params);
    }

    async findById(id: CommentId): Promise<Comment | null> {
        return (await this.find({ id }))[0] || null;
    }

    async create(item: CommentInitializer): Promise<Comment> {
        const entries = Object.entries(item).filter(([key, value]) => value !== undefined && key != 'id');
        const columns = entries.map(([key]) => key).join(', ');
        const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ');
        const values = entries.map(([_, value]) => value);

        const sql = `insert into comments (${columns})
                     values (${placeholders})
                     returning *`;
        const result = await this.query(sql, values);

        if (!result.rows[0]) {
            throw new Error(`Record creation failed`);
        }

        return result.rows[0];
    }

    async update(id: string, data: CommentMutator): Promise<Comment> {
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
        set.push(`updated_at = now()`);

        const filters: string[] = [];
        id.trim() && filters.push(`id = $${values.length + 1}`) && values.push(id.trim());
        user_id?.trim() && filters.push(`user_id = $${values.length + 1}`) && values.push(user_id.trim());

        if (filters.length == 0) {
            throw new Error('Update condition missing');
        }

        let where = filters.join(' and ');
        where = where ? `where ${where}` : '';

        const sql = `update comments
                     set ${set.join(', ')}
                     ${where}
                     returning *`;

        const result = await this.query(sql, values);
        if (!result.rows[0]) throw new Error(`Update failed`);

        return result.rows[0];
    }

    async delete(id: CommentId, context: { user_id?: UserId }): Promise<Comment> {
        const { user_id } = context;
        if (!id) throw new Error('Missing parameter: id');

        const values: unknown[] = [];
        const filters: string[] = [];
        id.trim() && filters.push(`id = $${values.length + 1}`) && values.push(id.trim());
        user_id?.trim() && filters.push(`user_id = $${values.length + 1}`) && values.push(user_id.trim());

        let where = filters.join(' and ');
        where = where ? `where ${where}` : '';

        const sql = `delete from comments
                     ${where}
                     returning *`;
        const result = await this.query(sql, values);
        if (!result.rows[0]) throw new Error(`Delete failed`);

        return result.rows[0];
    }
}