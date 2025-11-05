import type UserRole from '@shared/models/generated/UserRole'
import { BaseRepository } from './BaseRepository'

export class UserRoleRepository extends BaseRepository<UserRole> {
    async find({id, userId}:{id?: string, userId?: string}): Promise<UserRole[]> {
        const filters: string[] = [];
        const values: any[] = [];

        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        userId && filters.push(`user_id = $${filters.length + 1}`) && values.push(userId);
        // email && filters.push(`email = $${filters.length + 1}`) && values.push(email);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        const result = await this.pool.query<UserRole>(`select id, user_id, role
                                                        from user_roles
                                                        where ${filters.join(' and ')}`, values);
        return result.rows;
    }

    async findById(id: string): Promise<UserRole | null> {
        const result = await this.find({id});
        return result[0] || null;
    }

    create(item: UserRole): Promise<UserRole> {
        throw new Error("Method not implemented.")
    }

    update(id: string, item: Partial<UserRole>): Promise<UserRole | null> {
        throw new Error("Method not implemented.")
    }

    delete(item: UserRole): Promise<boolean> {
        throw new Error("Method not implemented.")
    }
}