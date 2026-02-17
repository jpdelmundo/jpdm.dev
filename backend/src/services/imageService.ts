import { ServiceError } from "@/errors/ServiceError.js";
import { FileRepository } from "@/repositories/FileRepository.js";
import { ImageRepository } from "@/repositories/ImageRepository.js";
import type { FindParamsBase } from "@/types/FindParams.js";
import { sign } from "@/utils/auth.js";
import { checkRequiredParameter } from "@/utils/helper.js";
import type ImageExtended from "@shared/models/extensions/ImageExtended.js";
import type { ImageId } from "@shared/models/generated/Image.js";
import type { PostId } from "@shared/models/generated/Post.js";
import type { UserId } from "@shared/models/generated/User.js";
import type { Actor } from "@shared/types/Actor.js";
import { ErrorCode } from "@shared/types/ErrorCode.js";
import path from 'path';
import * as fileService from './fileService.js';
import * as postService from './postService.js';

type GetParams = {
    current_user_id?: UserId;
    id?: ImageId;
    post_id?: PostId;
    // user_id?: UserId;
    // page_num?: number;
    // page_size?: number;
    // order_by?: string;
    // order_dir?: OrderDirection;
    //skip_access_check?: boolean;
}

export const get = async <P extends FindParamsBase>(params: P, actor?: Actor) => {
    const { id, post_id } = params as GetParams;
    const repo = new ImageRepository();

    let postId = post_id;
    if (!postId) {
        if (!id) throw new ServiceError('Missing parameter: id or post_id');
        //get image check post access
        const image = await repo.findById(id);
        if (!image) throw new ServiceError('Image not found', ErrorCode.NOT_FOUND);
        postId = image.post_id;
    }

    const post = (await postService.get({ id: postId }, actor))[0];
    if (!post?.id) throw new ServiceError('Post not found', ErrorCode.NOT_FOUND);

    const findParams = {
        ...(id && { id }),
        ...(post_id && { post_id })
    } as P;

    const findResult = await repo.find(findParams);

    const fileRepo = new FileRepository();
    const items = ('page_items' in findResult ? findResult.page_items : findResult) as ImageExtended[];
    for (const item of items) {
        const file = await fileRepo.findById(item.file_id);
        const url = new URL(path.posix.join(process.env.USERCONTENT_DIR!, file?.path || ''), process.env.STATIC_SERVER);
        const expires = Math.floor((Date.now() / 1000) + 900); //15min expiration
        const signature = sign(`${url.pathname}:${expires}`);
        url.searchParams.append('expires', expires.toString());
        url.searchParams.append('signature', signature);
        item.url = url.toString();
        item.width = file?.width || 0;
        item.height = file?.height || 0;
    }

    return findResult;
}

export const getById = async (id: ImageId, actor?: Actor) => {
    return (await get({ id }, actor))[0];
}

export const del = async (id: ImageId, actor: Actor) => {
    if (!id) throw new ServiceError('Missing parameter: id');

    //check if admin or if has access (current_user_id)
    if (!canDelete(id, actor)) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

    const repo = new ImageRepository();
    const image = await repo.findById(id);
    if (!image) throw new ServiceError(`Image not found: ${id}`);

    //delete files first
    fileService.del(image.file_id);

    //delete record
    repo.delete(id);
}

const canDelete = async (id: ImageId, actor: Actor) => {
    checkRequiredParameter({ id, actor });
    const repo = new ImageRepository();
    const image = await repo.findById(id);
    if (!image) return false;

    const canDelete = await postService.canModify(image.post_id, actor);
    return canDelete;
}