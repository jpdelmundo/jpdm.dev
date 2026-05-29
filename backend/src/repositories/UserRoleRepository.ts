import type { UserRole, UserRoleId } from '@shared/models/generated/UserRole.js';
import { BaseRepository } from './BaseRepository.js';

export class UserRoleRepository extends BaseRepository<UserRole> {
    async find({ id, userId }: { id?: string, userId?: string }): Promise<UserRole[]> {
        const filters: string[] = [];
        const values: unknown[] = [];

        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        userId && filters.push(`user_id = $${filters.length + 1}`) && values.push(userId);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        const result = await this.db.query<UserRole>(`select id, user_id, role
                                                        from user_roles
                                                        where ${filters.join(' and ')}`, values);
        return result.rows;
    }

    async findById(id: string): Promise<UserRole | null> {
        const result = await this.find({ id });
        return result[0] || null;
    }

    async create(_item: Partial<UserRole>): Promise<UserRole> {
        throw new Error('Method not implemented.');
    }

    async update(_id: UserRoleId | UserRoleId[], _data: Partial<UserRole>, _options?: Record<string, unknown>): Promise<UserRole[]> {
        throw new Error('Method not implemented.');
    }

    async delete(_id: string, _options?: Record<string, unknown>): Promise<UserRole> {
        throw new Error('Method not implemented.');
    }
}