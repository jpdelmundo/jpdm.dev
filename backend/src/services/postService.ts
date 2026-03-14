import { ServiceError } from '@/errors/ServiceError.js';
import type { ServiceContext } from '@/infra/serviceContext.js';
import type { Deps } from '@/types/Deps.js';
import type { KeyValue } from '@/types/KeyValue.js';
import { checkRequiredParameter } from '@/utils/helper.js';
import { compress } from '@/utils/image.js';
import { canModify as canModifyResource, hasRole, isOwner, isSystem } from '@/utils/permissions.js';
import type ImageExtended from '@shared/models/extensions/ImageExtended.js';
import type PostDTO from '@shared/models/extensions/PostExtended.js';
import { type File, type FileInitializer } from '@shared/models/generated/File.js';
import type { Image, ImageId } from '@shared/models/generated/Image.js';
import type { Post, PostId, PostInitializer, PostMutator } from '@shared/models/generated/Post.js';
import type { UserId } from '@shared/models/generated/User.js';
import type { VisibilityEnum } from '@shared/models/generated/VisibilityEnum.js';
import type { EnrichOptions } from '@shared/types/EnrichOptions.js';
import { ErrorCode } from '@shared/types/ErrorCode.js';
import type { OrderDirection } from '@shared/types/OrderDirection.js';
import { createHash } from 'crypto';
import { fileTypeFromFile } from 'file-type';
import fs from 'fs';
import { imageSizeFromFile } from 'image-size/fromFile';
import path from 'path';
import { validate } from 'uuid';
import { createFileService } from './fileService.js';
import { createImageService } from './imageService.js';
import { createPostLikeService } from './postLikeService.js';
import { createUserProfileService } from './userProfileService.js';
import { createUserService } from './userService.js';

type GetParams = {
    current_user_id?: UserId;
    id?: PostId;
    ids?: PostId[];
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
type UpdateInput = PostMutator & { files?: { id: string; file_id: string; sort: number }[]; };

export const createPostService = (ctx: ServiceContext) => {
    const { deps, actor } = ctx;

    const get = async <P extends KeyValue>(params: P) => {
        const { id, ids, user_id, visibility, is_published, page_num, page_size, order_by, order_dir } = params as GetParams;

        const findParams = {
            ...(id && { id }),
            ...(ids && { ids }),
            ...(user_id && { user_id }),
            ...(visibility && { visibility }),
            ...(is_published && { is_published }),
            ...(page_num && { page_num }),
            ...(page_size && { page_size }),
            ...(order_by && { order_by }),
            ...(order_dir && { order_dir }),
        } as P;

        const findResult = await deps.postRepo.find(findParams);

        return findResult;
    };

    const enrich = async (items: Post[], options: EnrichOptions = { include: ['stats', 'images'] }) => {
        const { include } = options;
        const userIds = [...new Set(items.map(i => i.user_id))];
        const postIds = [...new Set(items.map(i => i.id))];

        const users = await createUserService(ctx).get({ ids: userIds });
        const userProfiles = await createUserProfileService(ctx).get({ user_ids: userIds });
        const postLikes = actor.type == 'user' ? await createPostLikeService(ctx).get({ user_id: actor.id, post_ids: postIds }) : [];
        const postCommentsCount = include?.includes('stats') ? await getCommentsCount({ post_ids: postIds }) : [];

        const imageSvc = createImageService(ctx);
        const images = (include?.includes('images') ? await imageSvc.get({ post_ids: postIds }) : []) as Image[];
        const postImages = (images ? await imageSvc.enrich(images) : []) as ImageExtended[];

        const userMap = new Map(users.map(u => [u.id, u]));
        const userProfileMap = new Map(userProfiles.map(u => [u.user_id, u]));
        const postLikesMap = new Map(postLikes.map(l => [l.post_id, l]));
        const postCommentsCountMap = new Map(postCommentsCount.map(p => [p.post_id, p]));
        const postImagesMap = postImages.reduce((acc, item) => {
            const arr = acc.get(item.post_id) ?? [];
            arr.push(item);
            acc.set(item.post_id, arr);
            return acc;
        }, new Map<PostId, ImageExtended[]>());

        const getDisplayName = (id: UserId) => {
            const userProfile = userProfileMap.get(id);
            const user = userMap.get(id);
            const name = userProfile ? `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() : '';
            const result = !user ? '[not found]' : (name || user.username || '');
            return result;
        };

        const result: PostDTO[] = [];
        for (const item of items) {
            result.push({
                ...item,
                display_name: getDisplayName(item.user_id),
                avatar_url: userProfileMap.get(item.user_id)?.avatar_url || '',
                is_liked: !!postLikesMap.get(item.id),
                comments_count: include?.includes('stats') ? postCommentsCountMap.get(item.id)?.count || 0 : 0,
                images: include?.includes('images') ? postImagesMap.get(item.id) || [] : [],
            });
        }

        return result;
    };

    const getCommentsCount = async (params: { post_id?: PostId; post_ids?: PostId[] }) => {
        const { post_ids } = params;

        const getParams = {
            ...(post_ids && { post_ids })
        };
        console.log({ getParams });
        const result = await deps.postRepo.getCommentsCount(getParams);
        return result;
    };

    const getById = async (id: PostId) => {
        if (!id) throw new ServiceError('Missing parameter: id');
        if (!validate(id)) throw new ServiceError('Invalid post id', ErrorCode.INVALID_ID);

        const result = await get({ id });
        if (!result[0]) throw new ServiceError('Post not found', ErrorCode.NOT_FOUND);
        return result[0];
    };

    const create = async (data: CreateInput): Promise<PostDTO> => {
        const { user_id, title, content, files } = data;
        if (!user_id) throw new ServiceError('Missing parameter: user_id');
        if (!content || content.trim().length == 0) throw new ServiceError('Content cannot be empty', ErrorCode.MISSING_PARAMETER, { param: 'content' });
        if (content.length > 2000) throw new ServiceError('Content too long', ErrorCode.LENGTH_TOO_LONG, { param: 'content' });
        if (!isOwner(actor, data.user_id) && !isSystem(actor)) throw new ServiceError('Unauthorized request.', ErrorCode.FORBIDDEN);

        const txResult = await deps.withTransaction(async (txDeps: Deps) => {
            //create post
            const { postRepo, imageRepo, fileRepo } = txDeps;
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

        const result = (await get({ id: txResult.id, include: ['images'] }) as PostDTO[])[0];
        if (!result) throw new Error(`Post created but not found: ${txResult.id}`);

        return result;
    };

    const del = async (id: PostId) => {
        if (!id) throw new ServiceError('Missing parameter: id');
        if (!canModify(id)) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

        const deleted = await deps.withTransaction(async (txDeps: Deps) => {
            //get the post to get the images
            const postImages = await txDeps.imageRepo.find({ post_id: id });

            //delete files, get list of files to unlink
            const files = [];
            for (const image of postImages) {
                files.push(await txDeps.fileRepo.delete(image.file_id));
            }

            //delete images
            await txDeps.imageRepo.deleteByPostId(id);

            //delete comments
            await txDeps.commentRepo.deleteByPostId(id);

            const result = await txDeps.postRepo.delete(id);
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
    };

    const update = async (id: PostId, params: UpdateInput) => {
        const { title, content, files } = params;
        if (!id) throw new ServiceError('Missing parameter: id or post_id');
        if (!content || content.trim().length == 0) throw new ServiceError('Content cannot be empty', ErrorCode.MISSING_PARAMETER, { param: 'content' });
        if (content.length > 2000) throw new ServiceError('Content too long', ErrorCode.LENGTH_TOO_LONG, { param: 'content' });
        if (!canModify(id)) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

        const post = await getById(id);
        const [enrinched] = await enrich([post]);
        const images = enrinched?.images;
        const updated = await deps.withTransaction(async (txDeps: Deps) => {
            const newImageSet = new Set<ImageId>();
            if (files) {
                for (const image of files) {
                    const existing = images?.find(v => v.file_id == image.file_id);
                    if (existing) {
                        //update sort
                        await txDeps.imageRepo.update(existing.id, { sort: image.sort });
                        newImageSet.add(existing.id);
                    } else {
                        //check if file owned by user
                        const userFile = await txDeps.fileRepo.findById(image.file_id);
                        if (!userFile || userFile.user_id != current_user_id) continue;

                        const newImage = await txDeps.imageRepo.create({ file_id: image.file_id, post_id: post.id, sort: image.sort });
                        newImageSet.add(newImage.id);
                        //create
                    }
                }
            }

            const removeImages = images?.filter(v => !newImageSet.has(v.id));
            const deletedFiles = new Set<File>();
            if (removeImages) {
                for (const image of removeImages) {
                    const deletedFile = await txDeps.fileRepo.delete(image.file_id);
                    deletedFile && deletedFiles.add(deletedFile);
                    await txDeps.imageRepo.delete(image.id);
                }
            }

            const updated = await txDeps.postRepo.update(id, { title: title ?? null, content });

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

        const result = (await get({ id, include: ['images'] }))[0];
        if (!result?.id) throw new ServiceError(`Post not found. id: ${id}`, ErrorCode.NOT_FOUND);

        return result;
    };

    const canRead = async (id: PostId) => {
        checkRequiredParameter({ id, actor });
        const post = await deps.postRepo.findById(id);
        if (!post) return false;
        if (post.is_published && post.visibility == 'public') return true;
        if (isOwner(actor, post.user_id)) return true;
        if (isSystem(actor)) return true;
        if (hasRole(actor, 'admin')) return true;
        return false;
    };

    const uploadImage = async (post_id: PostId, file: Express.Multer.File) => {
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

        if (!canModify(post_id)) throw new ServiceError('Unauthorized request');

        const userDir = path.posix.join('images', createHash('sha256').update(post_id).digest('hex').slice(0, 16));
        const destDir = path.resolve(process.env.USERCONTENT_DIR!, userDir);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        const dimensions = type.mime.startsWith('image/') ? await imageSizeFromFile(`${file.path}`) : null;

        //compress uploaded file
        const parsed = path.parse(file.path);
        const compressed = await compress(file.path, { format: 'webp' });
        const compressedFilename = `${parsed.name}.webp`;
        const compressedFilePath = path.posix.join(destDir, compressedFilename);
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
        const createdFile = await createFileService(ctx).create(newFile);

        return createdFile;
    };

    const canModify = (post_id: PostId) => {
        return (async () => {
            const post = await deps.postRepo.findById(post_id);
            if (!post) return false;

            return canModifyResource(actor, post.user_id);
        })();
    };

    return {
        get,
        enrich,
        getCommentsCount,
        getById,
        create,
        delete: del,
        update,
        canRead,
        uploadImage,
        canModify
    };
};