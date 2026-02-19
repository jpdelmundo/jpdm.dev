import { ServiceError } from '@/errors/ServiceError.js';
import { withTransaction } from '@/infra/withTransaction.js';
import { CommentRepository } from '@/repositories/CommentRepository.js';
import { FileRepository } from '@/repositories/FileRepository.js';
import { ImageRepository } from '@/repositories/ImageRepository.js';
import { PostRepository } from '@/repositories/PostRepository.js';
import { UserRepository } from '@/repositories/UserRepository.js';
import * as userProfileService from '@/services/userProfileService.js';
import type { Deps } from '@/types/Deps.js';
import type { FindParamsBase } from '@/types/FindParams.js';
import type { UserContext } from '@/types/UserContext.js';
import { checkRequiredParameter } from '@/utils/helper.js';
import { compress } from '@/utils/image.js';
import type ImageExtended from '@shared/models/extensions/ImageExtended.js';
import type PostDTO from '@shared/models/extensions/PostExtended.js';
import { type File, type FileInitializer } from '@shared/models/generated/File.js';
import type { ImageId } from '@shared/models/generated/Image.js';
import type { PostId, PostInitializer, PostMutator } from '@shared/models/generated/Post.js';
import type { UserId } from '@shared/models/generated/User.js';
import type { VisibilityEnum } from '@shared/models/generated/VisibilityEnum.js';
import type { Actor } from '@shared/types/Actor.js';
import { ErrorCode } from '@shared/types/ErrorCode.js';
import type { OrderDirection } from '@shared/types/OrderDirection.js';
import { createHash } from 'crypto';
import { fileTypeFromFile } from 'file-type';
import fs from 'fs';
import { imageSizeFromFile } from 'image-size/fromFile';
import path from 'path';
import { validate } from 'uuid';
import * as commentService from './commentService.js';
import * as fileService from './fileService.js';
import * as imageService from './imageService.js';
import * as postLikeService from './postLikeService.js';

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

type CreateInput = PostInitializer & { files?: { file_id: string; sort: number }[]; }
type UpdateInput = PostMutator & { is_admin?: boolean; current_user_id?: UserId; files?: { id: string; file_id: string; sort: number }[]; };

const getDisplayName = async (id: UserId): Promise<string> => {
    const repo = new UserRepository();
    const user = await repo.findById(id);
    const userProfile = (await userProfileService.get({ user_id: id }))[0];
    const name = userProfile ? `${userProfile?.first_name} ${userProfile?.last_name}`.trim() : '';
    const result = !user ? '[not found]' : (name || user.username || '');
    return result;
}

export const get = async <P extends FindParamsBase>(params: P, actor?: Actor) => {
    const { id, user_id, visibility, is_published, page_num, page_size, order_by, order_dir, include } = params as GetParams;
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
        const userProfile = (await userProfileService.get({ user_id: post.user_id }))[0];
        post.display_name = await getDisplayName(user_id);
        post.is_liked = await postLikeService.isLiked(post.id, actor?.type == 'user' ? actor.id : undefined);
        post.avatar_url = userProfile?.avatar_url || '';
        include?.includes('stats') && (post.comments_count = await getCommentsCount(post_id, actor));
        include?.includes('images') && (post.images = (await imageService.get({ post_id }, actor)) as ImageExtended[]);
    }

    return findResult;
}

export const getById = async (id: PostId, params: { include?: string[] }, actor: Actor) => {
    if (!id) throw new ServiceError('Missing parameter: id');
    if (!validate(id)) throw new ServiceError('Invalid post id', ErrorCode.INVALID_ID);
    const { include } = params;

    if (!await canRead(id, actor)) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

    const result = await get({ id, include }, actor);
    if (!result[0]) throw new ServiceError('Post not found', ErrorCode.NOT_FOUND);
    return result[0];
}

export const create = async (data: CreateInput, deps: Deps, actor: Actor): Promise<PostDTO> => {
    const { user_id, title, content, files } = data;
    if (!user_id) throw new ServiceError('Missing parameter: user_id');
    if (!content || content.trim().length == 0) throw new ServiceError('Content cannot be empty', ErrorCode.MISSING_PARAMETER, { param: 'content' });
    if (content.length > 2000) throw new ServiceError('Content too long', ErrorCode.LENGTH_TOO_LONG, { param: 'content' });
    if (actor.type == 'user' && data.user_id != actor.id) throw new ServiceError('Unauthorized request.', ErrorCode.FORBIDDEN);

    const txResult = await deps.withTransaction(async (deps: Deps) => {
        //create post
        const { postRepo, imageRepo, fileRepo } = deps;
        const newPost = await postRepo.create({
            user_id,
            content,
            ...(title && { title })
        });
        if (!newPost) throw new Error('Failed creating post');

        //get id
        //create post files
        if (files && files.length > 0) {
            for (const file of files) {
                const userFile = await fileRepo.findById(file.file_id);
                if (!userFile || userFile.user_id != newPost.user_id) continue;

                const newImage = await imageRepo.create({ file_id: userFile.id, post_id: newPost.id, sort: file.sort });
                if (!newImage) throw new Error('Failed creating post image');

                //TODO move file from temp_upload to images/<post dir>/
                const userDir = path.posix.join('images', createHash('sha256').update(newPost.id).digest('hex').slice(0, 16));
                const destDir = path.resolve(process.env.USERCONTENT_DIR!, userDir);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }

                const filePath = path.resolve(process.env.USERCONTENT_DIR!, userFile.path);
                const newPath = path.join(userDir, path.basename(filePath));
                fs.copyFileSync(filePath, path.join(process.env.USERCONTENT_DIR!, newPath));
                fs.unlinkSync(filePath);

                //TODO update file.path to new path
                fileRepo.update(userFile.id, { path: newPath, expires_at: null });
            }
        }

        return newPost;
    });

    const result = (await get({ id: txResult.id, include: ['images'] }, actor) as PostDTO[])[0];
    if (!result) throw new Error(`Post created but not found: ${txResult.id}`);

    return result;
}

export const getCommentsCount = async (post_id: PostId, actor?: Actor) => {
    let count = 0;
    const result = await commentService.get({ post_id, page_num: 1, page_size: 1 }, actor);
    count = result.total;
    return count;
}

export const del = async (id: PostId, actor: Actor) => {
    if (!id) throw new ServiceError('Missing parameter: id');
    if (!canModify(id, actor)) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

    const deleted = await withTransaction(async (tx) => {
        //get the post to get the images
        const post = await getById(id, { include: ['images'] }, actor) as PostDTO;

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

export const update = async (id: PostId, params: UpdateInput, actor: Actor) => {
    const { title, content, current_user_id, is_admin, files } = params;
    if (!id) throw new ServiceError('Missing parameter: id or post_id');
    if (!current_user_id) throw new ServiceError('Missing parameter: current_user_id');
    if (!content || content.trim().length == 0) throw new ServiceError('Content cannot be empty', ErrorCode.MISSING_PARAMETER, { param: 'content' });
    if (content.length > 2000) throw new ServiceError('Content too long', ErrorCode.LENGTH_TOO_LONG, { param: 'content' });

    if (!is_admin && !canUpdate(id, { current_user_id: current_user_id! })) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

    const post = (await getById(id, { include: ['images'] }, actor)) as PostDTO;
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

    const result = (await get({ id, include: ['images'] }, actor))[0];
    if (!result?.id) throw new ServiceError(`Post not found. id: ${id}`, ErrorCode.NOT_FOUND);

    return result;
}

// export const canRead = async (id: PostId, actor: Actor) => {
//     checkRequiredParameter({ id, actor });
//     const { current_user_id } = actor;
//     const repo = new PostRepository();
//     const post = await repo.findById(id);
//     if (!post) throw new ServiceError(`Post not found. id: ${id}`, ErrorCode.NOT_FOUND);
//     if (post?.user_id === current_user_id) return true;
//     if (post.is_published && post.visibility == 'public') return true;
//     return false;
// }

export const canRead = async (id: PostId, actor: Actor) => {
    checkRequiredParameter({ id, actor });
    const repo = new PostRepository();
    const post = await repo.findById(id);
    if (!post) return false;

    if (post.is_published && post.visibility == 'public') return true;
    if (actor.type == 'user' && actor.id == post.user_id) return true;
    if (actor.type == 'system') return true;
    if (actor.roles.includes('admin')) return true;
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

export const uploadImage = async (post_id: PostId, file: Express.Multer.File, actor: Actor) => {
    if (!post_id) throw new ServiceError('Missing required parameter: post_id');
    if (!file) throw new ServiceError('Missing required parameter: file');
    const type = await fileTypeFromFile(file.path);
    if (!type) throw new ServiceError('Cannot determine file type');

    if (!type.mime.startsWith('image/')) {
        try {
            await fs.promises.unlink(file.path);
        } catch (err) {
            const e = err as NodeJS.ErrnoException;
            if (e.code !== 'ENOENT') throw e;
        }

        throw new ServiceError('File type not allowed', ErrorCode.NOT_ALLOWED);
    }

    if (!canModify(post_id, actor)) throw new ServiceError('Unauthorized request');

    const userDir = path.posix.join('images', createHash('sha256').update(post_id).digest('hex').slice(0, 16));
    const destDir = path.resolve(process.env.USERCONTENT_DIR!, userDir);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    const dimensions = type.mime.startsWith('image/') ? await imageSizeFromFile(`${file.path}`) : null;

    //compress uploaded file
    //console.log({ file });
    const parsed = path.parse(file.path);
    const compressed = await compress(file.path, { format: 'webp' });
    const compressedFilename = `${parsed.name}.webp`;
    const compressedFilePath = path.posix.join(destDir, compressedFilename);
    //console.log({ parsed: path.parse(compressedFilePath) });
    fs.writeFileSync(compressedFilePath, compressed);
    fs.unlinkSync(file.path);

    const newFile: FileInitializer = {
        user_id: actor.type == 'user' ? actor.id : '',
        filename: path.basename(compressedFilePath),
        orig_filename: file.originalname,
        mime_type: type.mime,
        path: path.posix.join(userDir, compressedFilename),
        size: file.size,
        expires_at: new Date(Date.now() + (60 * 60 * 1000)),
        ...(dimensions ? { width: dimensions.width, height: dimensions.height } : {})
    };
    const createdFile = await fileService.createFile(newFile);

    return createdFile;
}

export const canModify = async (post_id: PostId, actor: Actor) => {
    checkRequiredParameter({ post_id, actor });
    const repo = new PostRepository();
    const post = await repo.findById(post_id);
    if (!post) return false;

    if (actor.type == 'user' && actor.id == post.user_id) return true;
    if (actor.type == 'system') return true;
    if (actor.roles.includes('admin')) return true;
    return false;
}