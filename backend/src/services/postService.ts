import { ServiceError } from '@/errors/ServiceError';
import { FileRepository } from '@/repositories/FileRepository';
import { PostImageRepository } from '@/repositories/PostImageRepository';
import { PostRepository } from '@/repositories/PostRepository';
import { UserRepository } from '@/repositories/UserRepository';
import type { InferPaginatedResult } from '@/types/InferPaginatedResult';
import type PostExtended from '@shared/models/extensions/PostExtended';
import type PostImageExtended from '@shared/models/extensions/PostImageExtended';
import type { PostId, PostInitializer } from '@shared/models/generated/Post';
import type { PostImageId } from '@shared/models/generated/PostImage';
import type { UserId } from '@shared/models/generated/User';
import type { VisibilityEnum } from '@shared/models/generated/VisibilityEnum';
import { ErrorCode } from '@shared/types/ErrorCode';
import type { OrderDirection } from '@shared/types/OrderDirection';

type GetParams = {
    id?: PostId;
    user_id?: UserId;
    visibility?: VisibilityEnum;
    is_published?: boolean;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
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

export const get = async <P extends GetParams, T extends PostExtended>(params: P): Promise<InferPaginatedResult<P, T>> => {
    const { id, user_id, visibility, is_published, page_num, page_size, order_by, order_dir } = params;
    const repo = new PostRepository();
    const findResult = await repo.find({
        ...(id && { id }),
        ...(user_id && { user_id }),
        ...(visibility && { visibility }),
        ...(is_published && { is_published }),
        ...(page_num && { page_num }),
        ...(page_size && { page_size }),
        ...(order_by && { order_by }),
        ...(order_dir && { order_dir }),
    });

    const items = ('page_items' in findResult ? findResult.page_items : findResult) as PostExtended[];
    for (const post of items) {
        post.display_name = await getDisplayName(post.user_id);
        post.images = await getImages(post.id);
    }

    return findResult as InferPaginatedResult<P, T>;
}

export const getImage = async (id: PostImageId, user_id?: UserId): Promise<PostImageExtended> => {
    if (!id) throw new Error('Missing parameter: id');

    const repo = new PostImageRepository();
    const postImage = await repo.findById(id);
    if (!postImage || !postImage.id) throw new ServiceError(`Image not found: ${id}`, ErrorCode.NOT_FOUND);

    //check if post public (otherwise throw error)
    const postRepo = new PostRepository();
    const post = await postRepo.findById(postImage.post_id);
    if (!post || !post.id) throw new Error(`Post not found: ${postImage.post_id}`);
    if (!post.is_published) throw new ServiceError(`Image not available`, ErrorCode.NOT_AVAILABLE);
    if (post.visibility == 'private') {
        if (user_id != post.user_id) throw new ServiceError(`Image not available`, ErrorCode.NOT_AVAILABLE);
    }

    let result = postImage as PostImageExtended;
    if (postImage) {
        const fileRepo = new FileRepository();
        const file = await fileRepo.findById(postImage.file_id);
        if (!file) throw new Error(`File not found: ${postImage.file_id}`);
        result = {
            ...result,
            url: `${process.env.STATIC_SERVER}${process.env.USERCONTENT_IMAGE_PATH}/${file.filename}`,
            width: file.width || 0,
            height: file.height || 0
        };
    }
    return result;
}

export const getImages = async (post_id: PostId): Promise<PostImageExtended[]> => {
    const repo = new PostImageRepository();
    const postImages = await repo.find({ post_id });
    const images: PostImageExtended[] = [];
    if (postImages.length > 0) {
        for (const postImage of postImages) {
            try {
                images.push(await getImage(postImage.id));
            } catch (err) {
                console.error((err as Error).message);
            }
        }
    }

    return images;
}

export const create = async (params: CreateParams): Promise<PostExtended> => {
    const { content, files } = params;
    if (!content || content.trim().length == 0) throw new ServiceError('Content cannot be empty', ErrorCode.MISSING_PARAMETER, { param: 'content' });
    if (content.length > 2000) throw new ServiceError('Content too long', ErrorCode.LENGTH_TOO_LONG, { param: 'content' });

    //create post
    const postRepo = new PostRepository();
    const newPost = await postRepo.create(params);
    if (!newPost) throw new Error('Failed creating post');

    //get id
    //create post files
    if (files && files.length > 0) {
        const postImageRepo = new PostImageRepository();
        const fileRepo = new FileRepository();
        for (const file of files) {
            //check if file owned by user
            const userFile = await fileRepo.findById(file.fileId);
            if (!userFile || userFile.user_id != newPost.user_id) continue;

            const newPostImage = await postImageRepo.create({ file_id: userFile.id, post_id: newPost.id, sort: file.sort });
            if (!newPostImage) throw new Error('Failed creating post image');

            fileRepo.update(userFile.id, { expire_at: null });
        }
    }

    const result: PostExtended[] = await get({ id: newPost.id });
    if (!result[0]) throw new Error(`Post created but not found: ${newPost.id}`);

    return result[0];
}

