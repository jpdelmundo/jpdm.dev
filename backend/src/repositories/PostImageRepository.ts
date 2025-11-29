import type { FileId } from '@shared/models/generated/File';
import type { PostId } from '@shared/models/generated/Post';
import type { PostImage, PostImageId, PostImageInitializer, PostImageMutator } from '@shared/models/generated/PostImage';
import { type OrderDirection } from '@shared/types/OrderDirection';
import { BaseRepository } from './BaseRepository';

type FindParams = {
    id?: PostImageId;
    post_id?: PostId;
    file_id?: FileId;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
}

export class PostImageRepository extends BaseRepository<PostImage> {
    async find(params: FindParams) {
        const { id, file_id, post_id, order_by, order_dir } = params;
        const filters: string[] = [];
        const values: unknown[] = [];

        //where
        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        post_id && filters.push(`post_id = $${filters.length + 1}`) && values.push(post_id);
        file_id && filters.push(`file_id = $${filters.length + 1}`) && values.push(file_id);

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
        return this.getFindResult('post_images', filter, order, values, params);
    }

    async findById(id: PostImageId): Promise<PostImage | null> {
        return (await this.find({ id }))[0] || null;
    }

    async create(item: PostImageInitializer): Promise<PostImage> {
        const entries = Object.entries(item).filter(([key, value]) => value !== undefined && key != 'id');
        const columns = entries.map(([key]) => key).join(', ');
        const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ');
        const values = entries.map(([_, value]) => value);

        const sql = `insert into post_images (${columns})
                     values (${placeholders})
                     returning *`;
        const result = await this.query<PostImage>(sql, values);

        if (!result.rows[0]) {
            throw new Error(`Record creation failed`);
        }

        return result.rows[0];
    }

    async update(id: string, item: PostImageMutator): Promise<PostImage[]> {
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

        const sql = `update post_images
                     set ${set.join(', ')}
                     where ${where.join(' and ')}
                     returning *`;

        const result = await this.query<PostImage>(sql, values);

        return result.rows;
    }

    async delete(id: PostImageId): Promise<PostImage[]> {
        if (!id) throw new Error('Id missing');
        const sql = `delete from post_images
                     where id = $1
                     returning *`;
        const result = await this.query<PostImage>(sql, [id]);
        return result.rows;
    }
}