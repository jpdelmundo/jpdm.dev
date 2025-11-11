import type { FileId } from '@shared/models/generated/File';
import type { PostId } from '@shared/models/generated/Post';
import type PostFile from '@shared/models/generated/PostFile';
import type { PostFileId, PostFileInitializer, PostFileMutator } from '@shared/models/generated/PostFile';
import { BaseRepository } from './BaseRepository';

interface FindParams {
    id?: PostFileId;
    postId?: PostId;
    fileId?: FileId;
}

export class PostFileRepository extends BaseRepository<PostFile> {
    async find({ id, fileId, postId }: FindParams): Promise<PostFile[]> {
        const filters: string[] = [];
        const values: unknown[] = [];

        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        postId && filters.push(`post_id = $${filters.length + 1}`) && values.push(postId);
        fileId && filters.push(`file_id = $${filters.length + 1}`) && values.push(fileId);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        const result = await this.query<PostFile>(`select *
                                               from post_files
                                               where ${filters.join(' and ')}`, values);
        return result.rows;
    }

    async findById(id: PostFileId): Promise<PostFile | null> {
        return (await this.find({ id }))[0] || null;
    }

    async create(item: PostFileInitializer): Promise<PostFile> {
        const entries = Object.entries(item).filter(([key, value]) => value !== undefined && key != 'id');
        const columns = entries.map(([key]) => key).join(', ');
        const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ');
        const values = entries.map(([_, value]) => value);

        const sql = `insert into files (${columns})
                     values (${placeholders})
                     returning *`;
        const result = await this.query<PostFile>(sql, values);

        if (!result.rows[0]) {
            throw new Error(`Record creation failed`);
        }

        return result.rows[0];
    }

    async update(id: string, item: PostFileMutator): Promise<PostFile[]> {
        const entries = Object.entries(item).filter(([key, value]) => value !== undefined && key != 'id');
        const set: string[] = [];
        const values: unknown[] = [];

        entries.forEach(([key, value], index) => {
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

        const sql = `update files
                     set ${set.join(', ')}
                     where ${where.join(' and ')}
                     returning *`;

        const result = await this.query<PostFile>(sql, values);

        return result.rows;
    }

    async delete(id: PostFileId): Promise<PostFile[]> {
        if (!id) throw new Error('Id missing');
        const sql = `delete from files
                     where id = $1
                     returning *`;
        const result = await this.query<PostFile>(sql, [id]);
        return result.rows;
    }
}