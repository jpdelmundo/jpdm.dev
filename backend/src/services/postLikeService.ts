import { ServiceError } from '@/errors/ServiceError.js';
import type { ServiceContext } from '@/infra/serviceContext.js';
import type { KeyValue } from '@/types/KeyValue.js';
import { isAuthenticatedUser } from '@/utils/permissions.js';
import type { PostId } from '@shared/models/generated/Post.js';
import { ErrorCode } from '@shared/types/ErrorCode.js';

export const createPostLikeService = (ctx: ServiceContext) => {
    const { deps, actor } = ctx;

    const get = async <P extends KeyValue>(params: P) => {
        return deps.postLikeRepo.find(params);
    };

    const like = async (post_id: PostId) => {
        if (!post_id) throw new ServiceError('Missing parameter: post_id');
        if (!isAuthenticatedUser(actor)) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

        const newPostLike = await deps.postLikeRepo.create({ user_id: actor.id, post_id });
        if (!newPostLike) throw new Error('Failed creating like');

        const updatedPost = await deps.postRepo.updateLikes(post_id, 1);
        const { likes } = updatedPost;

        return { likes };
    };

    const unlike = async (post_id: PostId) => {
        if (!post_id) throw new ServiceError('Missing parameter: post_id');
        if (!isAuthenticatedUser(actor)) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

        const newPostLike = await deps.postLikeRepo.deleteLike(post_id, actor.id);
        if (!newPostLike) throw new Error('Failed deleting like');

        const updatedPost = await deps.postRepo.updateLikes(post_id, -1);
        const { likes } = updatedPost;

        return { likes };
    };

    return {
        get,
        like,
        unlike
    };
};