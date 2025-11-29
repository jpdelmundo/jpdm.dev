import type { PostId } from '@shared/models/generated/Post';
import type { PostComment, PostCommentId, PostCommentInitializer } from '@shared/models/generated/PostComment';
import { type OrderDirection } from '@shared/types/OrderDirection';
import { BaseRepository } from './BaseRepository';

type FindParams = {
    id?: PostCommentId;
    post_id?: PostId;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
}

export class PostCommentRepository extends BaseRepository<PostComment> {
    async find(params: FindParams) {
        const { id, post_id, order_by, order_dir } = params;
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

        //order
        let order = '';
        if (order_by) {
            const allowedOrderColumns = ['created_at'];
            order = this.getOrderBy(allowedOrderColumns, order_by, order_dir);
        }

        //get and return result
        return this.getFindResult('post_comments', filter, order, values, params);
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
        const result = await this.query<PostComment>(sql, values);

        if (!result.rows[0]) {
            throw new Error(`Record creation failed`);
        }

        return result.rows[0];
    }

    async update(id: string, item: PostCommentMutator): Promise<PostComment[]> {
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

        const where: string[] = [];
        id.trim() && where.push(`id = $${values.length + 1}`) && values.push(id.trim());

        if (where.length == 0) {
            throw new Error('Update condition missing');
        }

        const sql = `update post_comments
                     set ${set.join(', ')}
                     where ${where.join(' and ')}
                     returning *`;

        const result = await this.query<PostComment>(sql, values);

        return result.rows;
    }

    async delete(id: PostCommentId): Promise<PostComment[]> {
        if (!id) throw new Error('Id missing');
        const sql = `delete from post_comments
                     where id = $1
                     returning *`;
        const result = await this.query<PostComment>(sql, [id]);
        return result.rows;
    }
}