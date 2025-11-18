import type { FindParamsPaginated } from '@/types/FindParams';
import type { InferPaginatedResult } from '@/types/InferPaginatedResult';
import { isPaginated } from '@/utils/dataHelper';
import type { Post, PostId, PostInitializer, PostMutator } from '@shared/models/generated/Post';
import type { VisibilityEnum } from '@shared/models/generated/VisibilityEnum';
import { OrderDirections, type OrderDirection } from '@shared/types/OrderDirection';
import { BaseRepository } from './BaseRepository';

type FindParams = {
    id?: PostId;
    user_id?: string;
    visibility?: VisibilityEnum;
    is_published?: boolean;
    is_admin?: boolean;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
}

export class PostRepository extends BaseRepository<Post> {
    async find<P extends FindParams, T extends Post>(params: P): Promise<InferPaginatedResult<P, T>> {
        const { id, user_id, visibility, is_published, is_admin, order_by, order_dir } = params as FindParams;
        const filters: string[] = [];
        const values: unknown[] = [];

        //where
        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        user_id && filters.push(`user_id = $${filters.length + 1}`) && values.push(user_id);
        visibility && filters.push(`visibility = $${filters.length + 1}`) && values.push(visibility);
        is_published && filters.push(`is_published = $${filters.length + 1}`) && values.push(is_published);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        let filter = filters.join(' and ');
        filter = filter ? `where ${filter}` : '';

        //order
        let order = '';
        if (order_by) {
            const allowedOrderColumns = ['created_at'];
            if (allowedOrderColumns.includes(order_by)) {
                const dir = order_dir && OrderDirections.includes(order_dir) ? order_dir : 'asc';
                order = `order by ${order_by} ${dir}`;
            }
        }

        //limit
        let limit: string = '';
        if (isPaginated(params)) {
            const { page_num, page_size } = params as FindParamsPaginated;
            const pageNum = Math.min(Math.abs(Number(page_num)) || 1, 1000);
            const pageSize = Math.min(Math.abs(Number(page_size)) || 30, 30);
            limit = `limit $${values.length + 1}`;
            values.push(`${(pageNum - 1) * pageSize}`);
            limit += ` offset $${values.length + 1}`;
            values.push(pageSize);

            const totalResult = await this.query<{ total: number }>(`select count(*) total
                                                                     from posts
                                                                     ${filter}`, values);
            const paginatedResult = await this.query(`select *
                                                      from posts
                                                      ${filter}
                                                      ${order}
                                                      ${limit}`, values);

            return {
                page_items: paginatedResult.rows,
                total: totalResult.rows[0]?.total || 0,
                page_num: pageNum,
                page_size: pageSize
            } as InferPaginatedResult<P, T>;
        }

        const result = await this.query(`select *
                                         from posts
                                         ${filter}
                                         ${order}`, values);
        return result.rows as InferPaginatedResult<P, T>;
    }

    async findById(id: PostId): Promise<Post | null> {
        return (await this.find({ id }) as Post[])[0] || null;
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

    async update(id: string, item: PostMutator): Promise<Post[]> {
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

        return result.rows;
    }

    async delete(id: PostId): Promise<Post[]> {
        if (!id) throw new Error('Id missing');
        const sql = `delete from posts
                     where id = $1
                     returning *`;
        const result = await this.query<Post>(sql, [id]);
        return result.rows;
    }
}