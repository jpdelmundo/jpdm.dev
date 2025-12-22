import { withTransaction } from '@/db/withTransaction';
import { ServiceError } from '@/errors/ServiceError';
import { CommentRepository } from '@/repositories/CommentRepository';
import { FileRepository } from '@/repositories/FileRepository';
import { ImageRepository } from '@/repositories/ImageRepository';
import { PostRepository } from '@/repositories/PostRepository';
import { UserRepository } from '@/repositories/UserRepository';
import type { FindParamsBase } from '@/types/FindParams';
import type { UserContext } from '@/types/UserContext';
import type ImageExtended from '@shared/models/extensions/ImageExtended';
import type PostDTO from '@shared/models/extensions/PostExtended';
import { type File } from '@shared/models/generated/File';
import type { ImageId } from '@shared/models/generated/Image';
import type { PostId, PostInitializer, PostMutator } from '@shared/models/generated/Post';
import type { UserId } from '@shared/models/generated/User';
import type { VisibilityEnum } from '@shared/models/generated/VisibilityEnum';
import { ErrorCode } from '@shared/types/ErrorCode';
import type { OrderDirection } from '@shared/types/OrderDirection';
import fs from 'fs';
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

type CreateParams = PostInitializer & { files?: { file_id: string; sort: number }[]; }
type UpdateParams = PostMutator & { is_admin?: boolean; current_user_id?: UserId; files?: { id: string; file_id: string; sort: number }[]; };
type DeleteParams = { is_admin?: boolean; current_user_id?: UserId };

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
        // if (!post.is_published && !current_user_id) throw new ServiceError(`Post not available`, ErrorCode.NOT_AVAILABLE);
        // if (!post.is_published && (current_user_id && current_user_id !== user_id)) throw new ServiceError(`Post not available`, ErrorCode.NOT_AVAILABLE);
        // if (post.visibility == 'private' && current_user_id !== user_id) throw new ServiceError(`Post not available`, ErrorCode.NOT_AVAILABLE);

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

    if (!canRead(id, { current_user_id: current_user_id! })) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

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
            const userFile = await fileRepo.findById(file.file_id);
            if (!userFile || userFile.user_id != newPost.user_id) continue;

            const newImage = await postImageRepo.create({ file_id: userFile.id, post_id: newPost.id, sort: file.sort });
            if (!newImage) throw new Error('Failed creating post image');

            fileRepo.update(userFile.id, { expires_at: null });
        }
    }

    const result = await get({ id: newPost.id }) as PostDTO[];
    if (!result[0]) throw new Error(`Post created but not found: ${newPost.id}`);

    return result[0];
}

export const getCommentsCount = async (post_id: PostId) => {
    let count = 0;
    const result = await commentService.get({ post_id, page_num: 1, page_size: 1 });
    count = result.total;
    return count;
}

export const del = async (id: PostId, params: DeleteParams) => {
    const { is_admin, current_user_id } = params;
    if (!id) throw new ServiceError('Missing parameter: id');
    if (!is_admin && !current_user_id) throw new ServiceError('Missing parameter: current_user_id');

    //check if admin or if has access (current_user_id)
    if (!is_admin && !canDelete(id, { current_user_id: current_user_id! })) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

    const deleted = await withTransaction(async (tx) => {
        //get the post to get the images
        const post = await getById(id, { include: ['images'] }) as PostDTO;

        //delete files, get list of files to unlink
        const fileRepo = new FileRepository(tx);
        const files = [];
        for (const image of post.images) {
            files.push(await fileRepo.delete(image.file_id));
        }

        //delete images
        const imageRepo = new ImageRepository(tx);
        imageRepo.deleteByPostId(id);

        //delete comments
        const commentsRepo = new CommentRepository(tx);
        commentsRepo.deleteByPostId(id);

        const postRepo = new PostRepository(tx);
        const result = await postRepo.delete(id);
        if (!result?.id) throw new ServiceError(`Delete failed: ${id}`);

        return { post: result, files };
    });

    for (const file of deleted.files) {
        try {
            await fs.promises.unlink(file.path);
        } catch (err) {
            const e = err as NodeJS.ErrnoException;
            if (e.code !== 'ENOENT') throw e;
        }
    }

    return deleted.post;
}

export const update = async (id: PostId, params: UpdateParams) => {
    const { title, content, current_user_id, is_admin, files } = params;
    if (!id) throw new ServiceError('Missing parameter: id or post_id');
    if (!current_user_id) throw new ServiceError('Missing parameter: current_user_id');
    if (!content || content.trim().length == 0) throw new ServiceError('Content cannot be empty', ErrorCode.MISSING_PARAMETER, { param: 'content' });
    if (content.length > 2000) throw new ServiceError('Content too long', ErrorCode.LENGTH_TOO_LONG, { param: 'content' });

    if (!is_admin && !canUpdate(id, { current_user_id: current_user_id! })) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

    const post = (await getById(id, { include: ['images'] })) as PostDTO;
    const images = post.images;
    const updated = await withTransaction(async (tx) => {
        const fileRepo = new FileRepository(tx);
        const postImageRepo = new ImageRepository(tx);
        const newImageSet = new Set<ImageId>();
        if (files) {
            for (const image of files) {
                const existing = images.find(v => v.file_id == image.file_id);
                if (existing) {
                    //update sort
                    postImageRepo.update(existing.id, { sort: image.sort });
                    newImageSet.add(existing.id);
                } else {
                    //check if file owned by user
                    const userFile = await fileRepo.findById(image.file_id);
                    if (!userFile || userFile.user_id != current_user_id) continue;

                    const newImage = await postImageRepo.create({ file_id: image.file_id, post_id: post.id, sort: image.sort });
                    newImageSet.add(newImage.id);
                    //create
                }
            }
        }

        const removeImages = images.filter(v => !newImageSet.has(v.id));
        const deletedFiles = new Set<File>();
        for (const image of removeImages) {
            const deletedFile = await fileRepo.delete(image.file_id);
            deletedFile && deletedFiles.add(deletedFile);
            await postImageRepo.delete(image.id);
        }

        const repo = new PostRepository(tx);
        const updated = await repo.update(id, { title: title ?? null, content });

        return { post: updated, deletedFiles };
    });

    for (const file of updated.deletedFiles) {
        try {
            await fs.promises.unlink(file.path);
        } catch (err) {
            const e = err as NodeJS.ErrnoException;
            if (e.code !== 'ENOENT') throw e;
        }
    }

    const result = (await get({ id, current_user_id, include: ['images'] }))[0];
    if (!result?.id) throw new ServiceError(`Post not found. id: ${id}`, ErrorCode.NOT_FOUND);

    return result;
}

export const canRead = async (id: PostId, userContext: UserContext) => {
    const { current_user_id } = userContext;
    const repo = new PostRepository();
    const post = await repo.findById(id);
    if (!post) throw new ServiceError(`Post not found. id: ${id}`, ErrorCode.NOT_FOUND);
    if (post?.user_id === current_user_id) return true;
    if (post.is_published && post.visibility == 'public') return true;
    return false;
}

export const canUpdate = async (id: PostId, userContext: UserContext) => {
    const { current_user_id } = userContext;
    if (!current_user_id) throw new ServiceError('Missing parameter: current_user_id');
    const repo = new PostRepository();
    const post = await repo.findById(id);
    if (post?.user_id === current_user_id) return true;
    return false;
}

export const canDelete = async (id: PostId, userContext: UserContext) => {
    const { current_user_id } = userContext;
    if (!current_user_id) throw new ServiceError('Missing parameter: current_user_id');
    const repo = new PostRepository();
    const post = await repo.findById(id);
    if (post?.user_id === current_user_id) return true;
    return false;
}