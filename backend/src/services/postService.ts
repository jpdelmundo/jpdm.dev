import { FileRepository } from '@/repositories/FileRepository';
import { PostImageRepository } from '@/repositories/PostImageRepository';
import { PostRepository } from '@/repositories/PostRepository';
import type { InferPaginatedResult } from '@/types/InferPaginatedResult';
import type PostExtended from '@shared/models/extensions/PostExtended';
import type PostImageDetail from '@shared/models/extensions/PostImageDetail';
import type { PostId, PostInitializer } from '@shared/models/generated/Post';
import type { UserId } from '@shared/models/generated/User';
import type { VisibilityEnum } from '@shared/models/generated/VisibilityEnum';
import type { OrderDirection } from '@shared/types/OrderDirection';

export const getPost = async (id: PostId): Promise<PostExtended> => {
    const postRepo = new PostRepository();
    const post = await postRepo.findById(id);
    if (!post) throw new Error(`Post not found: ${id}`);

    const images = await getPostImages(post.id);
    const result: PostExtended = { ...post, images };
    return result;
}

type GetParams = {
    user_id?: UserId;
    visibility?: VisibilityEnum;
    is_published?: boolean;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
}

export const getPosts = async <P extends GetParams, T extends PostExtended>({ user_id, visibility, is_published, page_num, page_size, order_by, order_dir }: P): Promise<InferPaginatedResult<P, T>> => {
    const repo = new PostRepository();
    const findResult = await repo.find({
        ...(user_id && { user_id }),
        ...(visibility && { visibility }),
        ...(is_published && { is_published }),
        ...(page_num && { page_num }),
        ...(page_size && { page_size }),
        ...(order_by && { order_by }),
        ...(order_dir && { order_dir }),
    });

    const items = ('page_items' in findResult ? findResult.page_items : findResult) as PostExtended[];
    for (const post of items) post.images = await getPostImages(post.id);

    return findResult as InferPaginatedResult<P, T>;
}

export const getPostImages = async (post_id: PostId): Promise<PostImageDetail[]> => {
    const repo = new PostImageRepository();
    const postImages = await repo.find({ post_id });
    const images: PostImageDetail[] = [];
    if (postImages.length > 0) {
        const fileRepo = new FileRepository();
        for (const postImage of postImages) {
            const file = await fileRepo.findById(postImage.file_id);
            if (file) {
                images.push({
                    ...postImage,
                    url: file.url,
                    width: file.width || 0,
                    height: file.height || 0
                });
            }
        }
    }

    return images;
}

export const createPost = async (post: PostInitializer, { files }: { files?: { fileId: string; sort: number }[] }): Promise<PostExtended> => {
    const postRepo = new PostRepository();
    //create post
    const newPost = await postRepo.create(post);
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

    return getPost(newPost.id);
}

