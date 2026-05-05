import type { KeyValue } from '@/types/KeyValue.js';
import type { PostStatsDTO } from '@shared/models/dto/PostStatsDTO.js';
import type { PostViewsDTO } from '@shared/models/dto/PostViewsDTO.js';
import type { Post, PostId, PostInitializer, PostMutator } from '@shared/models/generated/Post.js';
import { type OrderDirection } from '@shared/types/OrderDirection.js';
import type { Visibility } from '@shared/types/Visibility.js';
import { BaseRepository } from './BaseRepository.js';

type FindParams = {
    id?: PostId;
    ids?: PostId[];
    user_id?: string;
    visibility?: Visibility;
    is_published?: boolean;
    is_admin?: boolean;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
}

export class PostRepository extends BaseRepository<Post> {
    async find<P extends KeyValue>(params: P) {
        const { id, ids, user_id, visibility, is_published, is_admin, order_by, order_dir } = params as FindParams;
        const filters: string[] = [];
        const values: unknown[] = [];

        //where
        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        ids && filters.push(`id = any($${filters.length + 1})`) && values.push(ids);
        user_id && filters.push(`user_id = $${filters.length + 1}`) && values.push(user_id);
        visibility && filters.push(`visibility = $${filters.length + 1}`) && values.push(visibility);
        is_published && filters.push(`is_published = $${filters.length + 1}`) && values.push(is_published);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        let filter = filters.join(' and ');
        filter = filter ? `where ${filter}` : '';

        //order by params
        const orderByParams = order_by ? { allowedOrderColumns: ['created_at'], order_by, order_dir } : null;

        //get and return result
        return this.getFindResult('posts', filter, orderByParams, values, params);
    }

    async findById(id: PostId): Promise<Post | null> {
        return (await this.find({ id }))[0] || null;
    }

    async create(item: PostInitializer): Promise<Post> {
        const entries = Object.entries(item).filter(([key, value]) => value !== undefined && key != 'id');
        const columns = entries.map(([key]) => key).join(', ');
        const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ');
        const values = entries.map(([_, value]) => value);

        const sql = `insert into posts (${columns})
                     values (${placeholders})
                     returning *`;
        const result = await this.query<Post>(sql, values);

        if (!result.rows[0]) {
            throw new Error(`Record creation failed`);
        }

        return result.rows[0];
    }

    async update(id: string, item: PostMutator): Promise<Post> {
        const entries = Object.entries(item).filter(([key, value]) => value !== undefined && key != 'id');
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

        if (filters.length == 0) {
            throw new Error('Update condition missing');
        }

        let filter = filters.join(' and ');
        filter = filter ? `where ${filter}` : '';

        const sql = `update posts
                     set ${set.join(', ')}
                     ${filter}
                     returning *`;

        const result = await this.query<Post>(sql, values);
        if (!result.rows[0]) throw new Error('Update failed');

        return result.rows[0];
    }

    async delete(id: PostId): Promise<Post> {
        if (!id) throw new Error('Missing parameter: id');
        const sql = `delete from posts
                     where id = $1
                     returning *`;
        const result = await this.query<Post>(sql, [id]);
        if (!result.rows[0]) throw new Error('Delete failed');

        return result.rows[0];
    }

    async updateLikes(id: PostId, amount: number = 1): Promise<Post> {
        if (!id) throw new Error('Missing parameter: id');
        const sql = `update posts
                     set likes = greatest(likes + $2, 0),
                        updated_at = now()
                     where id = $1
                     returning *`;
        const result = await this.query<Post>(sql, [id, amount]);
        if (!result.rows[0]) throw new Error('Update failed');

        return result.rows[0];
    }

    async updateViews(id: PostId, amount: number = 1): Promise<Post> {
        if (!id) throw new Error('Missing parameter: id');
        const sql = `update posts
                     set views = views + $2,
                        updated_at = now()
                     where id = $1
                     returning *`;
        const result = await this.query<Post>(sql, [id, amount]);
        if (!result.rows[0]) throw new Error('Update failed');

        return result.rows[0];
    }

    async getCommentsCount(params: Record<string, unknown>) {
        const { post_ids, post_id } = params;

        if (!post_ids && !post_id) throw new Error('Missing parameter: id or ids');

        const filters: string[] = [];
        const values: unknown[] = [];

        post_id && filters.push(`post_id = $${filters.length + 1}`) && values.push(post_id);
        post_ids && filters.push(`post_id = any($${filters.length + 1})`) && values.push(post_ids);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        let filter = filters.join(' and ');
        filter = filter ? `where ${filter}` : '';

        type PostCommentCount = { post_id: PostId; count: number };

        const sql = `select post_id, count(id)::int count
                    from post_comments
                    ${filter}
                    group by post_id`;
        const result = await this.query<PostCommentCount>(sql, values);

        return result.rows;
    }

    async getStats(params: KeyValue) {
        const { user_id, start_date, end_date } = params;

        const filters: string[] = [];
        const values: unknown[] = [];

        user_id !== undefined && (filters.push(`user_id = $${values.length + 1}`)) && values.push(user_id);
        start_date !== undefined && (filters.push(`created_at >= $${values.length + 1}`)) && values.push(start_date);
        end_date !== undefined && (filters.push(`created_at <= $${values.length + 1}`)) && values.push(end_date);

        let filter = filters.join(' and ');
        filter = filter ? `where ${filter}` : '';

        const sql = `select
(
    select count(*)::int from post_views
    ${filter}
) post_views_count,
(
    select count(*)::int from post_likes
    ${filter}
) post_likes_count,
(
    select count(*)::int from post_comments pc
    join posts p on p.id = pc.post_id
    ${filter.replace('user_id', 'p.user_id').replace(/created_at/gi, 'pc.created_at')}
) post_comments_count`;

        const { rows } = await this.query<PostStatsDTO>(sql, values);

        return rows[0];
    }

    async getPostViews(params: KeyValue) {
        const { user_id, start_date, end_date, client_tz } = params;

        const filters: string[] = [];
        const values: unknown[] = [];

        user_id !== undefined && (filters.push(`user_id = $${values.length + 1}`)) && values.push(user_id);
        start_date !== undefined && (filters.push(`created_at >= $${values.length + 1}`)) && values.push(start_date);
        end_date !== undefined && (filters.push(`created_at <= $${values.length + 1}`)) && values.push(end_date);

        let filter = filters.join(' and ');
        filter = filter ? `where ${filter}` : '';

        //TODO check if valid IANA timezone (check pg timezone table)
        const tz_clause = client_tz ? `at time zone '${String(client_tz).replace(/'/g, '')}'` : '';
        const sql = `select
    date_trunc('day', created_at ${tz_clause})::date date,
    count(*)::int count
from post_views
${filter}
group by 1
order by 1 asc;`;

        const { rows } = await this.query<PostViewsDTO>(sql, values);

        return rows;
    }
}