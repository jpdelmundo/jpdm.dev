import { ServiceError } from '@/errors/ServiceError.js';
import { PostRepository } from '@/repositories/PostRepository.js';
import { PostViewRepository } from '@/repositories/PostViewRepository.js';
import type { FindParamsBase } from '@/types/FindParams.js';
import { ipGeoLookup } from '@/utils/ipLookup.js';
import type { PostId } from '@shared/models/generated/Post.js';
import type { PostView, PostViewId, PostViewInitializer, PostViewMutator } from '@shared/models/generated/PostView.js';
import type { UserId } from '@shared/models/generated/User.js';
import type { OrderDirection } from '@shared/types/OrderDirection.js';

type GetParams = {
    current_user_id?: UserId;
    id?: PostViewId;
    post_id?: PostId;
    user_id?: UserId;
    device_id?: string;
    tz?: string;
    screen_width?: number;
    screen_height?: number;
    cpu_count?: number;
    referrer?: string;
    client?: string;
    ip?: string;
    os?: string;
    created_at?: Date;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
}

type CreateParams = PostViewInitializer;
type UpdateParams = PostViewMutator & { current_user_id?: UserId };
type DeleteParams = { is_admin?: boolean; current_user_id?: UserId };

export const create = async (params: CreateParams): Promise<PostView | null> => {
    const { user_id, post_id, device_id, tz, screen_height, screen_width, cpu_count, referrer, client, ip, os, device, device_type: dt } = params;
    if (!post_id) throw new ServiceError('Missing parameter: post_id');
    if (!device_id || !ip) return null;

    const device_type = dt || 'desktop';
    const location = ipGeoLookup(String(ip));

    //create post
    const repo = new PostViewRepository();
    const isViewHitOnCooldown = await repo.onCooldown(post_id, { device_id, ip });
    console.log({ isViewHitOnCooldown });
    if (isViewHitOnCooldown) return null;

    const newPostView = await repo.create({
        post_id,
        ...(user_id && { user_id }),
        ...(device_id && { device_id }),
        ...(tz && { tz }),
        ...(screen_height && { screen_height }),
        ...(screen_width && { screen_width }),
        ...(cpu_count && { cpu_count }),
        ...(referrer && { referrer }),
        ...(client && { client: client.trim() }),
        ...(ip && { ip }),
        ...(os && { os: os.trim() }),
        ...(device && { device: device.trim() }),
        ...(device_type && { device_type: device_type.trim() }),
        ...location
    });
    if (!newPostView) throw new Error('Failed creating view');

    const postRepo = new PostRepository();
    postRepo.updateViews(post_id, 1);

    const result = newPostView;
    return result;
}

export const get = async <P extends FindParamsBase>(params: P) => {
    const { id, post_id, user_id, device_id, tz, screen_height, screen_width, cpu_count, referrer, client, ip, os, page_num, page_size, order_by, order_dir } = params as GetParams;
    const repo = new PostViewRepository();

    const findParams = {
        ...(id && { id }),
        ...(device_id && { device_id }),
        ...(tz && { tz }),
        ...(screen_height && { screen_height }),
        ...(screen_width && { screen_width }),
        ...(cpu_count && { cpu_count }),
        ...(referrer && { referrer }),
        ...(client && { client }),
        ...(ip && { ip }),
        ...(os && { os }),
        ...(post_id && { post_id }),
        ...(user_id && { user_id }),
        ...(page_num && { page_num }),
        ...(page_size && { page_size }),
        ...(order_by && { order_by }),
        ...(order_dir && { order_dir })
    } as P;

    const findResult = await repo.find(findParams);
    return findResult;
}

export const update = async (id: PostViewId, params: UpdateParams) => {
    throw new Error('Method not implemented');
}

export const del = async (id: PostViewId, params: DeleteParams) => {
    throw new Error('Method not implemented');
}