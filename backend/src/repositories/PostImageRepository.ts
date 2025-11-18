import type { FileId } from '@shared/models/generated/File';
import type { PostId } from '@shared/models/generated/Post';
import type { PostImage, PostImageId, PostImageInitializer, PostImageMutator } from '@shared/models/generated/PostImage';
import { BaseRepository } from './BaseRepository';

interface FindParams {
    id?: PostImageId;
    post_id?: PostId;
    file_id?: FileId;
}

export class PostImageRepository extends BaseRepository<PostImage> {
    async find({ id, file_id, post_id }: FindParams): Promise<PostImage[]> {
        const filters: string[] = [];
        const values: unknown[] = [];

        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        post_id && filters.push(`post_id = $${filters.length + 1}`) && values.push(post_id);
        file_id && filters.push(`file_id = $${filters.length + 1}`) && values.push(file_id);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        const result = await this.query<PostImage>(`select *
                                               from post_files
                                               where ${filters.join(' and ')}`, values);
        return result.rows;
    }

    async findById(id: PostImageId): Promise<PostImage | null> {
        return (await this.find({ id }))[0] || null;
    }

    async create(item: PostImageInitializer): Promise<PostImage> {
        const entries = Object.entries(item).filter(([key, value]) => value !== undefined && key != 'id');
        const columns = entries.map(([key]) => key).join(', ');
        const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ');
        const values = entries.map(([_, value]) => value);

        const sql = `insert into post_files (${columns})
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

        const sql = `update post_files
                     set ${set.join(', ')}
                     where ${where.join(' and ')}
                     returning *`;

        const result = await this.query<PostImage>(sql, values);

        return result.rows;
    }

    async delete(id: PostImageId): Promise<PostImage[]> {
        if (!id) throw new Error('Id missing');
        const sql = `delete from post_files
                     where id = $1
                     returning *`;
        const result = await this.query<PostImage>(sql, [id]);
        return result.rows;
    }
}