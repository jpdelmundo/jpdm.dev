import { ServiceError } from '@/errors/ServiceError.js';
import type { ServiceContext } from '@/infra/serviceContext.js';
import type { KeyValue } from '@/types/KeyValue.js';
import type { PostId } from '@shared/models/generated/Post.js';
import type { PostLikeId } from '@shared/models/generated/PostLike.js';
import type { UserId } from '@shared/models/generated/User.js';
import type { OrderDirection } from '@shared/types/OrderDirection.js';

type GetParams = {
    current_user_id?: UserId;
    id?: PostLikeId;
    post_id?: PostId;
    post_ids?: PostId[];
    user_id?: UserId;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
}

export const createPostLikeService = (ctx: ServiceContext) => {
    const { deps, actor } = ctx;

    const get = async <P extends KeyValue>(params: P) => {
        const { user_id, post_ids, page_num, page_size, order_by, order_dir } = params as GetParams;

        const findParams = {
            ...(user_id && { user_id }),
            ...(post_ids && { post_ids }),
            ...(page_num && { page_num }),
            ...(page_size && { page_size }),
            ...(order_by && { order_by }),
            ...(order_dir && { order_dir }),
        } as P;

        const findResult = await deps.postLikeRepo.find(findParams);

        return findResult;
    };

    const like = async (post_id: PostId) => {
        if (!post_id) throw new ServiceError('Missing parameter: post_id');
        if (actor.type != 'user') throw new ServiceError('Missing parameter: user_id');

        const newPostLike = await deps.postLikeRepo.create({ user_id: actor.id, post_id });
        if (!newPostLike) throw new Error('Failed creating like');

        const updatedPost = await deps.postRepo.updateLikes(post_id, 1);
        const { likes } = updatedPost;

        return { likes };
    };

    const unlike = async (post_id: PostId) => {
        if (!post_id) throw new ServiceError('Missing parameter: post_id');
        if (actor.type != 'user') throw new ServiceError('Missing parameter: user_id');

        const newPostLike = await deps.postLikeRepo.deleteLike(post_id, actor.id);
        if (!newPostLike) throw new Error('Failed deleting like');

        const updatedPost = await deps.postRepo.updateLikes(post_id, -1);
        const { likes } = updatedPost;

        return { likes };
    };

    const isLiked = async (post_id: PostId) => {
        if (!post_id) throw new ServiceError('Missing parameter: post_id');
        if (actor.type != 'user') return false;

        const result = (await deps.postLikeRepo.find({ post_id, user_id: actor.id }))[0];

        return result?.id ? true : false;
    };

    return {
        get,
        like,
        unlike,
        isLiked
    };
};