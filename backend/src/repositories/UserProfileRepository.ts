import type { UserProfile, UserProfileId, UserProfileMutator } from '@shared/models/generated/UserProfile';
import { BaseRepository } from './BaseRepository';

interface FindParams {
    id?: string;
    userId?: string;
}

export class UserProfileRepository extends BaseRepository<UserProfile> {
    async find({ id, userId }: FindParams): Promise<UserProfile[]> {
        const filters: string[] = [];
        const values: unknown[] = [];

        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        userId && filters.push(`user_id = $${filters.length + 1}`) && values.push(userId);
        // email && filters.push(`email = $${filters.length + 1}`) && values.push(email);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        const result = await this.db.query<UserProfile>(`select *
                                                        from user_profiles
                                                        where ${filters.join(' and ')}`, values);
        return result.rows;
    }

    async findById(id: string): Promise<UserProfile | null> {
        const result = await this.find({ id });
        return result[0] || null;
    }

    create(item: UserProfile): Promise<UserProfile> {
        throw new Error("Method not implemented.")
    }

    update(id: string, item: UserProfileMutator): Promise<UserProfile> {
        throw new Error("Method not implemented.")
    }

    delete(id: UserProfileId): Promise<UserProfile> {
        throw new Error("Method not implemented.")
    }
}