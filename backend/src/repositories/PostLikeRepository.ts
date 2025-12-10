import type { FindParamsBase } from '@/types/FindParams';
import type { PostId } from '@shared/models/generated/Post';
import type { PostLike, PostLikeId, PostLikeInitializer, PostLikeMutator } from '@shared/models/generated/PostLike';
import type { UserId } from '@shared/models/generated/User';
import { type OrderDirection } from '@shared/types/OrderDirection';
import { BaseRepository } from './BaseRepository';

type FindParams = {
    id?: PostLikeId;
    post_id?: PostId;
    user_id?: UserId;
    created_at?: Date;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
    prioritize_user_id?: number;
}

export class PostLikeRepository extends BaseRepository<PostLike> {
    async find<P extends FindParamsBase>(params: P) {
        const { id, user_id, post_id, order_by, order_dir } = params as FindParams;
        const filters: string[] = [];
        const values: unknown[] = [];

        //where
        id && filters.push(`id = $${filters.length + 1}`) && values.push(id);
        post_id && filters.push(`post_id = $${filters.length + 1}`) && values.push(post_id);
        user_id && filters.push(`user_id = $${filters.length + 1}`) && values.push(user_id);

        if (filters.length == 0) {
            throw new Error('At least one filter must be provided');
        }

        let filter = filters.join(' and ');
        filter = filter ? `where ${filter}` : '';

        //order by params
        const orderByParams = order_by ? { allowedOrderColumns: ['created_at'], order_by, order_dir } : null;

        //get and return result
        return this.getFindResult('post_likes', filter, orderByParams, values, params);
    }

    async findById(id: PostLikeId): Promise<PostLike | null> {
        return (await this.find({ id }))[0] || null;
    }

    async create(item: PostLikeInitializer): Promise<PostLike> {
        const entries = Object.entries(item).filter(([key, value]) => value !== undefined && key != 'id');
        const columns = entries.map(([key]) => key).join(', ');
        const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ');
        const values = entries.map(([_, value]) => value);

        const sql = `insert into post_likes (${columns})
                     values (${placeholders})
                     returning *`;
        const result = await this.query(sql, values);

        if (!result.rows[0]) {
            throw new Error(`Record creation failed`);
        }

        return result.rows[0];
    }

    async update(id: string, data: PostLikeMutator): Promise<PostLike> {
        throw new Error('Method not implemented');
    }

    async delete(id: PostLikeId, context: { user_id?: UserId }): Promise<PostLike> {
        throw new Error('Method not implemented');
    }

    async deleteLike(postId: PostId, userId: UserId): Promise<PostLike> {
        if (!postId) throw new Error('Missing parameter: postId');
        if (!userId) throw new Error('Missing parameter: userId');
        const sql = `delete from post_likes
                        where post_id = $1
                            and user_id = $2
                        returning *`;
        const result = await this.query<PostLike>(sql, [postId, userId]);
        if (!result.rows[0]) throw new Error('Delete failed');

        return result.rows[0];
    }
}