import type { FindParamsBase } from '@/types/FindParams';
import type { PostId } from '@shared/models/generated/Post';
import type { PostView, PostViewId, PostViewInitializer, PostViewMutator } from '@shared/models/generated/PostView';
import type { UserId } from '@shared/models/generated/User';
import { type OrderDirection } from '@shared/types/OrderDirection';
import { BaseRepository } from './BaseRepository';

type FindParams = {
    id?: PostViewId;
    post_id?: PostId;
    user_id?: UserId;
    device_id?: string;
    tz?: string;
    screen_width?: number;
    screen_height?: number;
    cpu_count?: number;
    referer?: string;
    client?: string;
    ip?: string;
    os?: string;
    created_at?: Date;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
    prioritize_user_id?: number;
}

export class PostViewRepository extends BaseRepository<PostView> {
    async find<P extends FindParamsBase>(params: P) {
        const { id, user_id, post_id, order_by, order_dir, prioritize_user_id } = params as FindParams;
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
        return this.getFindResult('post_views', filter, orderByParams, values, params);
    }

    async findById(id: PostViewId): Promise<PostView | null> {
        return (await this.find({ id }))[0] || null;
    }

    async create(item: PostViewInitializer): Promise<PostView> {
        const entries = Object.entries(item).filter(([key, value]) => value !== undefined && key != 'id');
        const columns = entries.map(([key]) => key).join(', ');
        const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ');
        const values = entries.map(([_, value]) => value);

        const sql = `insert into post_views (${columns})
                     values (${placeholders})
                     returning *`;
        const result = await this.query(sql, values);

        if (!result.rows[0]) {
            throw new Error(`Record creation failed`);
        }

        return result.rows[0];
    }

    async update(id: string, data: PostViewMutator): Promise<PostView> {
        throw new Error('Method not implemented');
    }

    async delete(id: PostViewId, context: { user_id?: UserId }): Promise<PostView> {
        throw new Error('Method not implemented');
    }

    async onCooldown(id: PostId, { device_id, ip }: { device_id: string; ip: string; }): Promise<boolean> {
        if (!id) throw new Error('Missing parameter: id');
        const sql = `select exists(
                            select 1
                            from post_views pv
                            where pv.post_id = $1 and (pv.device_id = $2 or pv.ip = $3)
                            and pv.created_at >= now() - interval '10 seconds'
                        ) as on_cooldown`;
        const result = await this.query<{ on_cooldown: boolean }>(sql, [id, device_id, ip]);
        if (!result.rows[0]) throw new Error('Error in checking recent post view logs');

        return result.rows[0].on_cooldown;
    }
}