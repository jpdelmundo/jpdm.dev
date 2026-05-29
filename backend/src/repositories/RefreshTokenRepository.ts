import { RefreshTokenColumns, type RefreshToken, type RefreshTokenId, type RefreshTokenInitializer, type RefreshTokenMutator } from '@shared/models/generated/RefreshToken.js';
import type { UserId } from '@shared/models/generated/User.js';
import { BaseRepository } from './BaseRepository.js';

interface FindParams {
    id?: string;
    deviceId?: string;
    refreshToken?: string;
    userId?: string;
}

export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
    async find({ id, deviceId, refreshToken, userId }: FindParams): Promise<RefreshToken[]> {
        const filters: string[] = [];
        const values: unknown[] = [];

        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        deviceId && filters.push(`device_id = $${filters.length + 1}`) && values.push(deviceId);
        userId && filters.push(`user_id = $${filters.length + 1}`) && values.push(userId);
        // email && filters.push(`email = $${filters.length + 1}`) && values.push(email);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        const result = await this.query<RefreshToken>(`select *
                                                       from refresh_tokens
                                                       where ${filters.join(' and ')}`, values);
        return result.rows;
    }

    async findById(id: string): Promise<RefreshToken | null> {
        return (await this.find({ id }))[0] || null;
    }

    async create(item: RefreshTokenInitializer): Promise<RefreshToken> {
        const validColumns = new Set(RefreshTokenColumns as readonly string[]);
        const entries = Object.entries(item).filter(([key, value]) => validColumns.has(key) && value !== undefined);
        const columns = entries.map(([key]) => key).join(', ');
        const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ');
        const values = entries.map(([_, value]) => value);

        const sql = `insert into refresh_tokens (${columns})
                     values (${placeholders})
                     returning *`;
        const result = await this.query<RefreshToken>(sql, values);

        if (!result.rows[0]) {
            throw new Error(`Record creation failed`);
        }

        return result.rows[0];
    }

    async update(id: RefreshTokenId | RefreshTokenId[], item: RefreshTokenMutator): Promise<RefreshToken[]> {
        const validColumns = new Set(RefreshTokenColumns as readonly string[]);
        const entries = Object.entries(item).filter(([key, value]) => validColumns.has(key) && value !== undefined && key != 'id');
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

        const sql = `update refresh_tokens
                     set ${set.join(', ')}
                     where ${where.join(' and ')}
                     returning *`;

        const result = await this.query<RefreshToken>(sql, values);

        return result.rows;
    }

    async delete(id: RefreshTokenId): Promise<RefreshToken> {
        if (!id) throw new Error('Missing parameter: id');
        const sql = `delete from refresh_tokens
                     where id = $1
                     returning *`;
        const result = await this.query<RefreshToken>(sql, [id]);
        if (!result.rows[0]) throw new Error('Delete failed');

        return result.rows[0];
    }

    async markUserRefreshTokensAsUsed(user_id: UserId) {
        if (!user_id) throw new Error('Missing parameter: user_id');
        const sql = `update refresh_tokens
                    set used_at = now()
                    where user_id = $1
                    and used_at is null
                    returning *`;
        const result = await this.query<RefreshToken>(sql, [user_id]);

        return result.rows;
    }

    async markUserRefreshTokensAsRevoked(user_id: UserId) {
        if (!user_id) throw new Error('Missing parameter: user_id');
        const sql = `update refresh_tokens
                    set revoked_at = now()
                    where user_id = $1
                    and revoked_at is null
                    returning *`;
        const result = await this.query<RefreshToken>(sql, [user_id]);

        return result.rows;
    }
}