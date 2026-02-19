import { ServiceError } from '@/errors/ServiceError.js';
import { CommentRepository } from '@/repositories/CommentRepository.js';
import { PostRepository } from '@/repositories/PostRepository.js';
import { UserRepository } from '@/repositories/UserRepository.js';
import * as userProfileService from '@/services/userProfileService.js';
import type { FindParamsBase } from '@/types/FindParams.js';
import type { UserContext } from '@/types/UserContext.js';
import type { CommentDTO } from '@shared/models/dto/CommentDTO.js';
import type { CommentId, CommentInitializer, CommentMutator } from '@shared/models/generated/Comment.js';
import type { PostId } from '@shared/models/generated/Post.js';
import type { UserId } from '@shared/models/generated/User.js';
import type { Actor } from '@shared/types/Actor.js';
import { ErrorCode } from '@shared/types/ErrorCode.js';
import type { OrderDirection } from '@shared/types/OrderDirection.js';
import OpenAI from 'openai';

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
type Moderation = { is_allowed: boolean; reason: string; }

export const create = async (params: CreateParams, actor: Actor): Promise<CommentDTO> => {
    const { comment, post_id } = params;
    if (!post_id) throw new ServiceError('Missing parameter: post_id');
    if (!comment || comment.trim().length == 0) throw new ServiceError('Content cannot be empty', ErrorCode.MISSING_PARAMETER, { param: 'comment' });
    if (comment.length > 2000) throw new ServiceError('Content too long', ErrorCode.LENGTH_TOO_LONG, { param: 'comment' });

    const moderation = await moderate(comment);
    if (!moderation) throw new Error('Invalid AI moderation result');
    if (!moderation.is_allowed) throw new ServiceError(`AI Moderation: ${moderation.reason}`);

    //create comment
    const repo = new CommentRepository();
    const newComment = await repo.create({ ...params, comment: String(comment).trim().replace(/\n{3,}/g, '\n\n') });
    if (!newComment) throw new Error('Failed creating comment');

    const result = (await get({ id: newComment.id }, actor)) as CommentDTO[];
    if (!result[0]) throw new Error(`Comment created but not found: ${newComment.id}`);

    return result[0];
}

export const get = async <P extends FindParamsBase>(params: P, actor?: Actor) => {
    const { id, post_id, user_id, page_num, page_size, order_by, order_dir } = params as GetParams;
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
        ...(actor?.type == 'user' && { prioritize_user_id: actor.id }),
    } as P;

    const findResult = await repo.find(findParams);

    const items = ('page_items' in findResult ? findResult.page_items : findResult) as CommentDTO[];
    for (const item of items) {
        const userProfile = (await userProfileService.get({ user_id: item.user_id }))[0];
        item.display_name = await getDisplayName(item.user_id);
        item.avatar_url = userProfile?.avatar_url || '';
    }

    return findResult;
}

const getDisplayName = async (id: UserId): Promise<string> => {
    const repo = new UserRepository();
    const user = await repo.findById(id);
    const userProfile = (await userProfileService.get({ user_id: id }))[0];
    const name = userProfile ? `${userProfile?.first_name} ${userProfile?.last_name}`.trim() : '';
    const result = !user ? '[not found]' : (name || user.username || '');
    return result;
}

export const update = async (id: CommentId, params: UpdateParams, options: Record<string, unknown>) => {
    const { comment } = params;
    const { current_user_id } = options;
    if (!id) throw new ServiceError('Missing parameter: id or post_id');
    if (!current_user_id) throw new ServiceError('Missing parameter: current_user_id');
    if (!comment || comment.trim().length == 0) throw new ServiceError('Content cannot be empty', ErrorCode.MISSING_PARAMETER, { param: 'comment' });
    if (comment.length > 2000) throw new ServiceError('Content too long', ErrorCode.LENGTH_TOO_LONG, { param: 'comment' });

    const moderation = await moderate(comment);
    console.log({ moderation });
    if (!moderation) throw new Error('Invalid AI moderation result');
    if (!moderation.is_allowed) throw new ServiceError(`AI Moderation: ${moderation.reason}`);

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

const moderate = async (comment: string): Promise<Moderation | null> => {
    const llm = new OpenAI({
        apiKey: process.env.LITELLM_VIRTUAL_KEY,
        baseURL: process.env.LITELLM_API_BASE_URL
    });

    const result = await llm.chat.completions.create({
        model: 'moderation-model',
        messages: [
            {
                role: 'system',
                content: `You are a content moderation system.
Respond ONLY with valid JSON:
{
  "is_allowed": boolean,
  "reason": string
}

DO NOT:
- include the comment in the reason value
- allow insults, anything about the face, mouth or look
- accept spam messages

If is_allowed = true, set reason to empty string, otherwise state clearly but concisely like talking to a human being why it's not allowed.`
            },
            {
                role: 'user',
                content: comment
            }
        ],
        temperature: 0
    });

    const content = result.choices[0]?.message.content;

    return content ? JSON.parse(content) : null;
}