import { ServiceError } from '@/errors/ServiceError';
import { FileRepository } from '@/repositories/FileRepository';
import { ImageRepository } from '@/repositories/ImageRepository';
import { PostRepository } from '@/repositories/PostRepository';
import { UserRepository } from '@/repositories/UserRepository';
import type { FindParamsBase } from '@/types/FindParams';
import type ImageExtended from '@shared/models/extensions/ImageExtended';
import type PostDTO from '@shared/models/extensions/PostExtended';
import type { ImageId } from '@shared/models/generated/Image';
import type { PostId, PostInitializer } from '@shared/models/generated/Post';
import type { UserId } from '@shared/models/generated/User';
import type { VisibilityEnum } from '@shared/models/generated/VisibilityEnum';
import { ErrorCode } from '@shared/types/ErrorCode';
import type { OrderDirection } from '@shared/types/OrderDirection';
import { validate } from 'uuid';
import * as commentService from './commentService';
import * as imageService from './imageService';
import * as postLikeService from './postLikeService';

type GetParams = {
    current_user_id?: UserId;
    id?: PostId;
    user_id?: UserId;
    visibility?: VisibilityEnum;
    is_published?: boolean;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
    include?: string[];
}

type GetImageParams = {
    current_user_id?: UserId;
    id?: ImageId;
    is_published?: boolean;
    skip_access_check?: boolean;
}

type GetImagesParams = {
    current_user_id?: UserId;
    post_id?: PostId;
}

type CreateParams = PostInitializer & {
    files?: { fileId: string; sort: number }[];
}

const getDisplayName = async (id: UserId): Promise<string> => {
    const repo = new UserRepository();
    const postUser = await repo.findById(id);
    const result = !postUser ? '[not found]' : postUser.username;
    return result;
}

export const get = async <P extends FindParamsBase>(params: P) => {
    const { current_user_id, id, user_id, visibility, is_published, page_num, page_size, order_by, order_dir, include } = params as GetParams;
    const repo = new PostRepository();

    const findParams = {
        ...(id && { id }),
        ...(user_id && { user_id }),
        ...(visibility && { visibility }),
        ...(is_published && { is_published }),
        ...(page_num && { page_num }),
        ...(page_size && { page_size }),
        ...(order_by && { order_by }),
        ...(order_dir && { order_dir }),
    } as P;

    const findResult = await repo.find(findParams);

    const items = ('page_items' in findResult ? findResult.page_items : findResult) as PostDTO[];
    for (const post of items) {
        const { id: post_id, user_id } = post;
        if (!post.is_published && !current_user_id) throw new ServiceError(`Post not available`, ErrorCode.NOT_AVAILABLE);
        if (!post.is_published && (current_user_id && current_user_id !== user_id)) throw new ServiceError(`Post not available`, ErrorCode.NOT_AVAILABLE);
        if (post.visibility == 'private' && current_user_id !== user_id) throw new ServiceError(`Post not available`, ErrorCode.NOT_AVAILABLE);

        post.display_name = await getDisplayName(user_id);
        post.is_liked = await postLikeService.isLiked(post.id, current_user_id);
        include?.includes('stats') && (post.comments_count = await getCommentsCount(post_id));
        include?.includes('images') && (post.images = (await imageService.get({ post_id })) as ImageExtended[]);
    }

    return findResult;
}

export const getById = async (id: PostId, params: { include?: string[], current_user_id?: UserId }) => {
    if (!id) throw new ServiceError('Missing parameter: id');
    if (!validate(id)) throw new ServiceError('Invalid post id', ErrorCode.INVALID_ID);
    const { current_user_id, include } = params;
    const result = await get({ id, current_user_id, include });
    if (!result[0]) throw new ServiceError('Post not found', ErrorCode.NOT_FOUND);
    return result[0];
}

export const create = async (params: CreateParams): Promise<PostDTO> => {
    const { user_id, title, content, files } = params;
    if (!user_id) throw new ServiceError('Missing parameter: user_id');
    if (!content || content.trim().length == 0) throw new ServiceError('Content cannot be empty', ErrorCode.MISSING_PARAMETER, { param: 'content' });
    if (content.length > 2000) throw new ServiceError('Content too long', ErrorCode.LENGTH_TOO_LONG, { param: 'content' });

    //create post
    const postRepo = new PostRepository();
    const newPost = await postRepo.create({
        user_id,
        content,
        ...(title && { title })
    });
    if (!newPost) throw new Error('Failed creating post');

    //get id
    //create post files
    if (files && files.length > 0) {
        const postImageRepo = new ImageRepository();
        const fileRepo = new FileRepository();
        for (const file of files) {
            //check if file owned by user
            const userFile = await fileRepo.findById(file.fileId);
            if (!userFile || userFile.user_id != newPost.user_id) continue;

            const newImage = await postImageRepo.create({ file_id: userFile.id, post_id: newPost.id, sort: file.sort });
            if (!newImage) throw new Error('Failed creating post image');

            fileRepo.update(userFile.id, { expire_at: null });
        }
    }

    const result = await get({ id: newPost.id }) as PostDTO[];
    if (!result[0]) throw new Error(`Post created but not found: ${newPost.id}`);

    return result[0];
}

export const hasAccess = async (current_user_id: UserId | undefined, id: PostId) => {
    try {
        const post = (await get({ current_user_id, id }))[0];
        if (!post?.id) return false;
        if (!post.is_published && !current_user_id) return false;
        if (!post.is_published && (current_user_id && post.user_id != current_user_id)) return false;
    } catch (error) {
        if (error instanceof ServiceError && error.code == ErrorCode.NOT_AVAILABLE) {
            return false;
        }
        throw error;
    }
}

export const getCommentsCount = async (post_id: PostId) => {
    let count = 0;
    const result = await commentService.get({ post_id, page_num: 1, page_size: 1 });
    count = result.total;
    return count;
}