import { ServiceError } from '@/errors/ServiceError';
import { CommentRepository } from '@/repositories/CommentRepository';
import { PostRepository } from '@/repositories/PostRepository';
import { UserRepository } from '@/repositories/UserRepository';
import type { FindParamsBase } from '@/types/FindParams';
import type { UserContext } from '@/types/UserContext';
import type { CommentDTO } from '@shared/models/dto/CommentDTO';
import type { CommentId, CommentInitializer, CommentMutator } from '@shared/models/generated/Comment';
import type { PostId } from '@shared/models/generated/Post';
import type { UserId } from '@shared/models/generated/User';
import { ErrorCode } from '@shared/types/ErrorCode';
import type { OrderDirection } from '@shared/types/OrderDirection';

type GetParams = {
    current_user_id?: UserId;
    id?: CommentId;
    post_id?: PostId;
    user_id?: UserId;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
}

type CreateParams = CommentInitializer;
type UpdateParams = CommentMutator;
type DeleteParams = { is_admin?: boolean; current_user_id?: UserId };

export const create = async (params: CreateParams): Promise<CommentDTO> => {
    const { comment, post_id } = params;
    if (!post_id) throw new ServiceError('Missing parameter: post_id');
    if (!comment || comment.trim().length == 0) throw new ServiceError('Content cannot be empty', ErrorCode.MISSING_PARAMETER, { param: 'comment' });
    if (comment.length > 2000) throw new ServiceError('Content too long', ErrorCode.LENGTH_TOO_LONG, { param: 'comment' });

    //create comment
    const repo = new CommentRepository();
    const newComment = await repo.create({ ...params, comment: String(comment).trim().replace(/\n{3,}/g, '\n\n') });
    if (!newComment) throw new Error('Failed creating comment');

    const result = (await get({ id: newComment.id })) as CommentDTO[];
    if (!result[0]) throw new Error(`Comment created but not found: ${newComment.id}`);

    return result[0];
}

export const get = async <P extends FindParamsBase>(params: P) => {
    const { current_user_id, id, post_id, user_id, page_num, page_size, order_by, order_dir } = params as GetParams;
    const repo = new CommentRepository();

    // let postId = post_id;
    // if (!postId) {
    //     //id params is require
    //     if (!id) throw new ServiceError('Missing parameter: id or post_id');
    //     //get comment check post access
    //     const comment = await repo.findById(id);
    //     if (!comment) throw new ServiceError('Comment not found', ErrorCode.NOT_FOUND);
    //     postId = comment.post_id;
    // }

    // const post = (await postService.get({ id: postId, current_user_id }))[0];
    // if (!post?.id) throw new ServiceError('Post not found', ErrorCode.NOT_FOUND);

    const findParams = {
        ...(id && { id }),
        ...(post_id && { post_id }),
        ...(user_id && { user_id }),
        ...(page_num && { page_num }),
        ...(page_size && { page_size }),
        ...(order_by && { order_by }),
        ...(order_dir && { order_dir }),
        ...(current_user_id && { prioritize_user_id: current_user_id }),
    } as P;

    const findResult = await repo.find(findParams);

    const items = ('page_items' in findResult ? findResult.page_items : findResult) as CommentDTO[];
    for (const item of items) {
        item.display_name = await getDisplayName(item.user_id);
    }

    return findResult;
}

const getDisplayName = async (id: UserId): Promise<string> => {
    const repo = new UserRepository();
    const user = await repo.findById(id);
    const result = !user ? '[not found]' : user.username;
    return result;
}

export const update = async (id: CommentId, params: UpdateParams, options: Record<string, unknown>) => {
    const { comment } = params;
    const { current_user_id } = options;
    if (!id) throw new ServiceError('Missing parameter: id or post_id');
    if (!current_user_id) throw new ServiceError('Missing parameter: current_user_id');

    const repo = new CommentRepository();
    const updated = await repo.update(id, {
        ...(comment && { comment })
    });

    const result = (await get({ id: updated?.id, current_user_id }))[0];
    if (!result?.id) throw new ServiceError('Comment not found', ErrorCode.NOT_FOUND);

    return result;
}

export const del = async (id: CommentId, params: DeleteParams) => {
    const { is_admin, current_user_id } = params;
    if (!id) throw new ServiceError('Missing parameter: id');
    if (!is_admin && !current_user_id) throw new ServiceError('Missing parameter: current_user_id');

    if (!is_admin && !canDelete(id, { current_user_id: current_user_id! })) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

    const repo = new CommentRepository();
    const deleted = await repo.delete(id);
    if (!deleted?.id) throw new ServiceError(`Failed deleting comment. id: ${id}`);

    return deleted;
}

export const delByPostId = async (id: PostId) => {
    if (!id) throw new ServiceError('Missing parameter: id');
    const repo = new CommentRepository();
    const deletedCount = await repo.deleteByPostId(id);
    return deletedCount;
}

export const canRead = async (id: CommentId, userContext: UserContext) => {
    const { current_user_id } = userContext;
    if (!current_user_id) throw new ServiceError('Missing parameter: current_user_id');
    const commentRepo = new CommentRepository();
    const comment = await commentRepo.findById(id);
    if (!comment) throw new ServiceError(`Comment not found. id: ${id}`);

    const repo = new PostRepository();
    const post = await repo.findById(comment.post_id);
    if (post?.user_id === current_user_id) return true;
    if (post?.is_published && post?.visibility == 'public') return true;
    return false;
}

export const canDelete = async (id: CommentId, userContext: UserContext) => {
    const { current_user_id } = userContext;
    if (!current_user_id) throw new ServiceError('Missing parameter: current_user_id');
    const commentRepo = new CommentRepository();
    const comment = await commentRepo.findById(id);
    if (!comment) throw new ServiceError(`Comment not found. id: ${id}`);

    const repo = new PostRepository();
    const post = await repo.findById(comment.post_id);
    if (post?.user_id === current_user_id) return true;
    return false;
}