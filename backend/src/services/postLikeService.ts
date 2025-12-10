import { ServiceError } from '@/errors/ServiceError';
import { PostLikeRepository } from '@/repositories/PostLikeRepository';
import { PostRepository } from '@/repositories/PostRepository';
import type { PostId } from '@shared/models/generated/Post';
import type { PostLikeId, PostLikeInitializer, PostLikeMutator } from '@shared/models/generated/PostLike';
import type { UserId } from '@shared/models/generated/User';
import type { OrderDirection } from '@shared/types/OrderDirection';

type GetParams = {
    current_user_id?: UserId;
    id?: PostLikeId;
    post_id?: PostId;
    user_id?: UserId;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
}

type CreateParams = PostLikeInitializer;
type UpdateParams = PostLikeMutator & { current_user_id?: UserId };
type DeleteParams = PostLikeMutator;

export const like = async (post_id: PostId, user_id: UserId) => {
    if (!post_id) throw new ServiceError('Missing parameter: post_id');
    if (!user_id) throw new ServiceError('Missing parameter: user_id');

    const repo = new PostLikeRepository();
    const newPostLike = await repo.create({ user_id, post_id });
    if (!newPostLike) throw new Error('Failed creating like');

    const postRepo = new PostRepository();
    const updatedPost = await postRepo.updateLikes(post_id, 1);
    const { likes } = updatedPost;

    return { likes };
}

export const unlike = async (post_id: PostId, user_id: UserId) => {
    if (!post_id) throw new ServiceError('Missing parameter: post_id');
    if (!user_id) throw new ServiceError('Missing parameter: user_id');

    const repo = new PostLikeRepository();
    const newPostLike = await repo.deleteLike(post_id, user_id);
    if (!newPostLike) throw new Error('Failed deleting like');

    const postRepo = new PostRepository();
    const updatedPost = await postRepo.updateLikes(post_id, -1);
    const { likes } = updatedPost;

    return { likes };
}

export const isLiked = async (post_id: PostId, user_id: UserId | undefined) => {
    if (!post_id) throw new ServiceError('Missing parameter: post_id');
    if (!user_id) return false;

    const repo = new PostLikeRepository();
    const result = (await repo.find({ post_id, user_id }))[0];

    return result?.id ? true : false;
}