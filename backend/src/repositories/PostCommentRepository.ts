import { getDateParamCondition } from '@/infra/pgHelper.js';
import type { KeyValue } from '@/types/KeyValue.js';
import type { PostComment, PostCommentId, PostCommentInitializer, PostCommentMutator } from '@shared/models/generated/PostComment.js';
import type { PostId } from '@shared/models/generated/Post.js';
import type { UserId } from '@shared/models/generated/User.js';
import type { DateComparison } from '@shared/types/DateComparison.js';
import { type OrderDirection } from '@shared/types/OrderDirection.js';
import { BaseRepository } from './BaseRepository.js';

type FindParams = {
    id?: PostCommentId;
    post_id?: PostId;
    comment?: string;
    date_from?: DateComparison;
    date_to?: DateComparison;
    user_id?: UserId;
    status?: string[];
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
    prioritize_user_id?: number;
}

export class PostCommentRepository extends BaseRepository<PostComment> {
    async find<P extends KeyValue>(params: P & FindParams) {
        const { id, post_id, comment, date_from, date_to, user_id, status, order_by, order_dir, prioritize_user_id } = params as FindParams;
        const filters: string[] = [];
        const values: unknown[] = [];

        //where
        id && filters.push(`id = $${values.length + 1}`) && values.push(id);
        user_id && filters.push(`user_id = $${values.length + 1}`) && values.push(user_id);
        post_id && filters.push(`post_id = $${values.length + 1}`) && values.push(post_id);
        comment && filters.push(`comment ilike $${values.length + 1}`) && values.push(`%${comment}%`);
        date_from && filters.push(getDateParamCondition('created_at', date_from, values));
        date_to && filters.push(getDateParamCondition('created_at', date_to, values));
        status && filters.push(`status = ANY($${values.length + 1})`) && values.push(status);

        if (values.length == 0) {
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
        return this.getFindResult('post_comments', filter, orderByParams, values, params);
    }

    async findById(id: PostCommentId): Promise<PostComment | null> {
        return (await this.find({ id }))[0] || null;
    }

    async create(item: PostCommentInitializer): Promise<PostComment> {
        const entries = Object.entries(item).filter(([key, value]) => value !== undefined && key != 'id');
        const columns = entries.map(([key]) => key).join(', ');
        const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ');
        const values = entries.map(([_, value]) => value);

        const sql = `insert into post_comments (${columns})
                     values (${placeholders})
                     returning *`;
        const result = await this.query(sql, values);

        if (!result.rows[0]) {
            throw new Error(`Record creation failed`);
        }

        return result.rows[0];
    }

    async update(id: PostCommentId | PostCommentId[], data: PostCommentMutator, options: Record<string, unknown> = {}): Promise<PostComment[]> {
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

        const where: string[] = [];
        !Array.isArray(id) && id.trim() && where.push(`id = $${values.length + 1}`) && values.push(id.trim());
        Array.isArray(id) && where.push(`id = any($${values.length + 1})`) && values.push(id.map(i => i.trim()));
        user_id?.trim() && where.push(`user_id = $${values.length + 1}`) && values.push(user_id.trim());

        if (where.length == 0) {
            throw new Error('Update condition missing');
        }

        const sql = `update post_comments
                     set ${set.join(', ')}
                     where ${where.join(' and ')}
                     returning *`;

        const result = await this.query(sql, values);

        return result.rows;
    }

    async delete(id: PostCommentId): Promise<PostComment> {
        if (!id) throw new Error('Missing parameter: id');

        const sql = `delete
                    from post_comments
                    where id = $1
                    returning *`;
        const result = await this.query(sql, [id]);
        if (!result.rows[0]) throw new Error(`Delete failed`);

        return result.rows[0];
    }

    async deleteByPostId(id: PostId) {
        if (!id) throw new Error('Missing parameter: id');

        const sql = `delete
                    from post_comments
                    where post_id = $1`;
        const result = await this.query(sql, [id]);
        return result.rowCount;
    }
}