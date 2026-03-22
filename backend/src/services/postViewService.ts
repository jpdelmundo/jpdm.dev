import { ServiceError } from "@/errors/ServiceError.js";
import type { ServiceContext } from "@/infra/serviceContext.js";
import type { KeyValue } from "@/types/KeyValue.js";
import { ipGeoLookup } from "@/utils/ipLookup.js";
import type { PostView, PostViewId, PostViewInitializer, PostViewMutator } from "@shared/models/generated/PostView.js";
import type { UserId } from "@shared/models/generated/User.js";

type CreateParams = PostViewInitializer;
type UpdateParams = PostViewMutator & { current_user_id?: UserId };
type DeleteParams = { is_admin?: boolean; current_user_id?: UserId };

export const createPostViewService = (ctx: ServiceContext) => {
    const { deps } = ctx;

    const create = async (params: CreateParams): Promise<PostView | null> => {
        const { user_id, post_id, device_id, tz, screen_height, screen_width, cpu_count, referrer, client, ip, os, device, device_type: dt } = params;
        if (!post_id) throw new ServiceError('Missing parameter: post_id');
        if (!device_id || !ip) return null;

        const device_type = dt || 'desktop';
        const location = ipGeoLookup(String(ip));

        //create post
        const isViewHitOnCooldown = await deps.postViewRepo.onCooldown(post_id, { device_id, ip });
        console.log({ isViewHitOnCooldown });
        if (isViewHitOnCooldown) return null;

        const newPostView = await deps.postViewRepo.create({
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

        await deps.postRepo.updateViews(post_id, 1);

        const result = newPostView;
        return result;
    };

    const get = async <P extends KeyValue>(params: P) => {
        return deps.postViewRepo.find(params);
    };

    const update = async (id: PostViewId, params: UpdateParams) => {
        throw new Error('Method not implemented');
    };

    const del = async (id: PostViewId, params: DeleteParams) => {
        throw new Error('Method not implemented');
    };

    return {
        create,
        get,
        update,
        delete: del
    };
};