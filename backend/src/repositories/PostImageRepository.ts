import type { FileId } from '@shared/models/generated/File.js';
import type { PostImage, PostImageId, PostImageInitializer, PostImageMutator } from '@shared/models/generated/PostImage.js';
import type { PostId } from '@shared/models/generated/Post.js';
import { type OrderDirection } from '@shared/types/OrderDirection.js';
import { BaseRepository } from './BaseRepository.js';

type FindParams = {
    id?: PostImageId;
    post_id?: PostId;
    post_ids?: PostId[];
    file_id?: FileId;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
}

export class PostImageRepository extends BaseRepository<PostImage> {
    async find<P extends FindParams>(params: P) {
        const { id, file_id, post_id, post_ids, order_by, order_dir } = params;
        const filters: string[] = [];
        const values: unknown[] = [];

        //where
        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        post_id && filters.push(`post_id = $${filters.length + 1}`) && values.push(post_id);
        post_ids && filters.push(`post_id = any($${filters.length + 1})`) && values.push(post_ids);
        file_id && filters.push(`file_id = $${filters.length + 1}`) && values.push(file_id);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        let filter = filters.join(' and ');
        filter = filter ? `where ${filter}` : '';

        //order by params
        const orderByParams = order_by ? { allowedOrderColumns: ['created_at'], order_by, order_dir } : null;

        //get and return result
        return this.getFindResult('post_images', filter, orderByParams, values, params);
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

    async update(id: PostImageId | PostImageId[], item: PostImageMutator): Promise<PostImage[]> {
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
        !Array.isArray(id) && id.trim() && where.push(`id = $${values.length + 1}`) && values.push(id.trim());
        Array.isArray(id) && where.push(`id = any($${values.length + 1})`) && values.push(id.map(i => i.trim()));

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

    async delete(id: PostImageId): Promise<PostImage> {
        if (!id) throw new Error('Missing parameter: id');
        const sql = `delete from post_images
                     where id = $1
                     returning *`;
        const result = await this.query<PostImage>(sql, [id]);
        if (!result.rows[0]) throw new Error('Delete failed');

        return result.rows[0];
    }

    async deleteByPostId(id: PostId) {
        if (!id) throw new Error('Missing parameter: id');

        const sql = `delete
                    from post_images
                    where post_id = $1
                    returning *`;
        const result = await this.query(sql, [id]);
        return result.rows;
    }
}