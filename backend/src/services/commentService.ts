import { ServiceError } from '@/errors/ServiceError.js';
import type { ServiceContext } from '@/infra/serviceContext.js';
import { createPostService } from '@/services/postService.js';
import { createUserProfileService } from '@/services/userProfileService.js';
import { createUserService } from '@/services/userService.js';
import type { KeyValue } from '@/types/KeyValue.js';
import { moderateComment } from '@/utils/llm.js';
import { canModify as _canModify } from '@/utils/permissions.js';
import type { CommentDTO, CommentDTO as Comments } from '@shared/models/dto/CommentDTO.js';
import type PostDTO from '@shared/models/dto/PostDTO.js';
import type { Comment, CommentId, CommentInitializer, CommentMutator } from '@shared/models/generated/Comment.js';
import type { Post } from '@shared/models/generated/Post.js';
import type { UserId } from '@shared/models/generated/User.js';
import { ErrorCode } from '@shared/types/ErrorCode.js';

type CreateParams = CommentInitializer;
type UpdateParams = CommentMutator;

export const createCommentService = (ctx: ServiceContext) => {
    const { deps, actor } = ctx;

    const canModify = async (id: CommentId): Promise<boolean> => {
        if (!id) return false;
        const item = await deps.commentRepo.findById(id);
        if (!item) return false;

        return _canModify(actor, item.user_id);
    };

    const create = async (params: CreateParams): Promise<Comments> => {
        const { user_id, comment, post_id } = params;
        if (!user_id) throw new ServiceError('Missing parameter: user_id');
        if (!post_id) throw new ServiceError('Missing parameter: post_id');
        if (!comment || comment.trim().length == 0) throw new ServiceError('Content cannot be empty', ErrorCode.MISSING_PARAMETER, { param: 'comment' });
        if (comment.length > 2000) throw new ServiceError('Content too long', ErrorCode.LENGTH_TOO_LONG, { param: 'comment' });

        const moderation = await moderateComment(comment);
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
        const findParams = {
            ...params,
            ...(actor?.type == 'user' && { prioritize_user_id: actor.id }),
        } as P;
        return deps.commentRepo.find(findParams);
    };

    const enrich = async (items: Comment[], options: { include?: string[] } = {}): Promise<CommentDTO[]> => {
        const { include } = options;
        const userIds = [...new Set(items.map(i => i.user_id))];
        const postIds = [...new Set(items.map(i => i.post_id))];
        const userProfileSvc = createUserProfileService(ctx);

        const users = await createUserService(ctx).get({ ids: userIds });
        const userProfiles = await userProfileSvc.get({ user_ids: userIds });
        const userProfilesEnrinched = await userProfileSvc.enrich(userProfiles);

        let posts: Post[] = [];
        let enrichedPosts: PostDTO[] = [];
        if (include?.includes('post')) {
            const postSvc = createPostService(ctx);
            posts = await postSvc.get({ ids: postIds });
            enrichedPosts = await postSvc.enrich(posts, { include: [] });
        }

        const userMap = new Map(users.map(i => [i.id, i]));
        const userProfileMap = new Map(userProfilesEnrinched.map(i => [i.user_id, i]));
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
        if (!await canModify(id)) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);
        if (!comment || comment.trim().length == 0) throw new ServiceError('Content cannot be empty', ErrorCode.MISSING_PARAMETER, { param: 'comment' });
        if (comment.length > 2000) throw new ServiceError('Content too long', ErrorCode.LENGTH_TOO_LONG, { param: 'comment' });


        const moderation = await moderateComment(comment);
        if (!moderation) throw new Error('Invalid AI moderation result');
        if (!moderation.is_allowed) throw new ServiceError(`AI Moderation: ${moderation.reason}`);

        const updated = await deps.commentRepo.update(id, {
            ...(comment && { comment: String(comment).trim().replace(/\n{3,}/g, "\n\n") })
        });

        return updated;
    };

    const del = async (id: CommentId): Promise<Comment | null> => {
        if (!id) throw new ServiceError('Missing parameter: id');
        if (!await canModify(id)) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

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