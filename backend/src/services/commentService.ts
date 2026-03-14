import { ServiceError } from '@/errors/ServiceError.js';
import type { ServiceContext } from '@/infra/serviceContext.js';
import { CommentRepository } from '@/repositories/CommentRepository.js';
import { createPostService } from '@/services/postService.js';
import { createUserProfileService } from '@/services/userProfileService.js';
import { createUserService } from '@/services/userService.js';
import type { KeyValue } from '@/types/KeyValue.js';
import { canModify as canModifyResource } from '@/utils/permissions.js';
import type { CommentDTO, CommentDTO as Comments } from '@shared/models/dto/CommentDTO.js';
import type PostDTO from '@shared/models/extensions/PostExtended.js';
import type { Comment, CommentId, CommentInitializer, CommentMutator } from '@shared/models/generated/Comment.js';
import type { Post, PostId } from '@shared/models/generated/Post.js';
import type { UserId } from '@shared/models/generated/User.js';
import type { DateComparison } from '@shared/types/DateComparison.js';
import { ErrorCode } from '@shared/types/ErrorCode.js';
import type { Moderation } from '@shared/types/Moderation.js';
import type { OrderDirection } from '@shared/types/OrderDirection.js';
import OpenAI from 'openai';

type GetParams = {
    id?: CommentId;
    comment?: string;
    date_from?: DateComparison;
    date_to?: DateComparison;
    post_id?: PostId;
    user_id?: UserId;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
    include?: string[];
}

type CreateParams = CommentInitializer;
type UpdateParams = CommentMutator;

export const createCommentService = (ctx: ServiceContext) => {
    const { deps, actor } = ctx;

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
Respond ONLY with valid JSON with properties:
- is_allowed: boolean
- reason: string

Disallow:
- insults, anything about the face, mouth or looks
- spam messages

Rules:
- If is_allowed = true, set "reason" to an empty string.
- If is_allowed = false, state clearly and concisely like talking to a human being why it's not allowed.
- Do NOT include the name/username in the reason value.`
                },
                {
                    role: 'user',
                    content: comment
                }
            ],
            temperature: 0,
            response_format: { type: "json_object" }
        });

        const content = result.choices[0]?.message.content;

        return content ? JSON.parse(content) : null;
    };

    const canModify = async (id: CommentId): Promise<boolean> => {
        if (!id) return false;
        if (!actor) return false;

        const item = await deps.commentRepo.findById(id);
        if (!item) return false;

        return canModifyResource(actor, item.user_id);
    };

    const create = async (params: CreateParams): Promise<Comments> => {
        const { user_id, comment, post_id } = params;
        if (!user_id) throw new ServiceError('Missing parameter: user_id');
        if (!post_id) throw new ServiceError('Missing parameter: post_id');
        if (!comment || comment.trim().length == 0) throw new ServiceError('Content cannot be empty', ErrorCode.MISSING_PARAMETER, { param: 'comment' });
        if (comment.length > 2000) throw new ServiceError('Content too long', ErrorCode.LENGTH_TOO_LONG, { param: 'comment' });

        const moderation = await moderate(comment);
        if (!moderation) throw new Error('Invalid AI moderation result');
        if (!moderation.is_allowed) throw new ServiceError(`AI Moderation: ${moderation.reason}`);

        //create comment
        const newComment = await deps.commentRepo.create({ ...params, comment: String(comment).trim().replace(/\n{3,}/g, "\n\n") });
        if (!newComment) throw new Error('Failed creating comment');

        const result = (await get({ id: newComment.id })) as Comments[];
        if (!result[0]) throw new Error(`Comment created but not found: ${newComment.id}`);

        return result[0];
    };

    const get = async <P extends KeyValue>(params: P) => {
        const { id, post_id, user_id, comment, date_from, date_to, page_num, page_size, order_by, order_dir } = params as GetParams;

        const findParams = {
            ...(id && { id }),
            ...(post_id && { post_id }),
            ...(comment && { comment }),
            ...(date_from && { date_from }),
            ...(date_to && { date_to }),
            ...(user_id && { user_id }),
            ...(page_num && { page_num }),
            ...(page_size && { page_size }),
            ...(order_by && { order_by }),
            ...(order_dir && { order_dir }),
            ...(actor?.type == 'user' && { prioritize_user_id: actor.id }),
        } as P;

        const findResult = await deps.commentRepo.find(findParams);

        return findResult;
    };

    const enrich = async (items: Comment[], options: { include?: string[] } = {}): Promise<CommentDTO[]> => {
        const { include } = options;
        const userIds = [...new Set(items.map(i => i.user_id))];
        const postIds = [...new Set(items.map(i => i.post_id))];

        const users = await createUserService(ctx).get({ ids: userIds });
        const userProfiles = await createUserProfileService(ctx).get({ user_ids: userIds });

        let posts: Post[] = [];
        let enrichedPosts: PostDTO[] = [];
        if (include?.includes('post')) {
            const postSvc = createPostService(ctx);
            posts = await postSvc.get({ ids: postIds });
            enrichedPosts = await postSvc.enrich(posts, { include: [] });
        }

        const userMap = new Map(users.map(i => [i.id, i]));
        const userProfileMap = new Map(userProfiles.map(i => [i.user_id, i]));
        const postMap = new Map(enrichedPosts.map(i => [i.id, i]));

        const getDisplayName = (id: UserId) => {
            const userProfile = userProfileMap.get(id);
            const user = userMap.get(id);
            const name = userProfile ? `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() : '';
            const result = !user ? '[not found]' : (name || user.username || '');
            return result;
        };

        const result: CommentDTO[] = [];
        for (const item of items) {
            result.push({
                ...item,
                display_name: getDisplayName(item.user_id),
                avatar_url: userProfileMap.get(item.user_id)?.avatar_url || '',
                ...(include?.includes('post') && { post: postMap.get(item.post_id) as PostDTO })
            });
        }

        return result;
    };

    const update = async (id: CommentId, params: UpdateParams): Promise<Comment | null> => {
        const { comment } = params;

        if (!id) throw new ServiceError('Missing parameter: id');
        if (!(await canModify(id))) throw new ServiceError('Unauthorized request');
        if (!comment || comment.trim().length == 0) throw new ServiceError('Content cannot be empty', ErrorCode.MISSING_PARAMETER, { param: 'comment' });
        if (comment.length > 2000) throw new ServiceError('Content too long', ErrorCode.LENGTH_TOO_LONG, { param: 'comment' });


        const moderation = await moderate(comment);
        if (!moderation) throw new Error('Invalid AI moderation result');
        if (!moderation.is_allowed) throw new ServiceError(`AI Moderation: ${moderation.reason}`);

        const repo = new CommentRepository();
        const updated = await repo.update(id, {
            ...(comment && { comment: String(comment).trim().replace(/\n{3,}/g, "\n\n") })
        });

        return updated;
    };

    const del = async (id: CommentId): Promise<Comment | null> => {
        if (!id) throw new ServiceError('Missing parameter: id');
        if (!(await canModify(id))) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

        const deleted = await deps.commentRepo.delete(id);
        if (!deleted?.id) throw new ServiceError(`Failed deleting comment. id: ${id}`);

        return deleted;
    };

    return {
        create,
        get,
        enrich,
        update,
        delete: del
    };
};