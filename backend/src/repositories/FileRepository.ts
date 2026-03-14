import type { KeyValue } from '@/types/KeyValue.js';
import type { File, FileId, FileInitializer, FileMutator } from '@shared/models/generated/File.js';
import type { PostId } from '@shared/models/generated/Post.js';
import type { UserId } from '@shared/models/generated/User.js';
import { BaseRepository } from './BaseRepository.js';

interface FindParams {
    id?: FileId;
    ids?: FileId[];
    postId?: PostId;
    userId?: UserId;
}

export class FileRepository extends BaseRepository<File> {
    async find<P extends KeyValue>(params: P) {
        const { id, ids, postId, userId } = params;
        const filters: string[] = [];
        const values: unknown[] = [];

        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        ids && filters.push(`id = any($${filters.length + 1})`) && values.push(ids);
        postId && filters.push(`post_id = $${filters.length + 1}`) && values.push(postId);
        userId && filters.push(`user_id = $${filters.length + 1}`) && values.push(userId);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        const result = await this.query<File>(`select *
                                               from files
                                               where ${filters.join(' and ')}`, values);
        return result.rows;
    }

    async findById(id: FileId): Promise<File | null> {
        return (await this.find({ id }))[0] || null;
    }

    async create(item: FileInitializer): Promise<File> {
        const entries = Object.entries(item).filter(([key, value]) => value !== undefined && key != 'id');
        const columns = entries.map(([key]) => key).join(', ');
        const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ');
        const values = entries.map(([_, value]) => value);

        const sql = `insert into files (${columns})
                     values (${placeholders})
                     returning *`;
        const result = await this.query<File>(sql, values);
        if (!result.rows[0]) throw new Error(`Record creation failed`);

        return result.rows[0];
    }

    async update(id: string, item: FileMutator): Promise<File> {
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

        const result = await this.query<File>(sql, values);
        if (!result.rows[0]) throw new Error('Update failed');

        return result.rows[0];
    }

    async delete(id: FileId): Promise<File> {
        if (!id) throw new Error('Missing parameter: id');
        const sql = `delete from files
                     where id = $1
                     returning *`;
        const result = await this.query<File>(sql, [id]);
        if (!result.rows[0]) throw new Error(`Failed to delete file. id: ${id}`);
        return result.rows[0];
    }
}