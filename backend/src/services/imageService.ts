import { ServiceError } from "@/errors/ServiceError";
import { FileRepository } from "@/repositories/FileRepository";
import { ImageRepository } from "@/repositories/ImageRepository";
import type { FindParamsBase } from "@/types/FindParams";
import type { UserContext } from "@/types/UserContext";
import type ImageExtended from "@shared/models/extensions/ImageExtended";
import type { ImageId } from "@shared/models/generated/Image";
import type { PostId } from "@shared/models/generated/Post";
import type { UserId } from "@shared/models/generated/User";
import { ErrorCode } from "@shared/types/ErrorCode";
import path from 'path';
import * as fileService from './fileService';
import * as postService from './postService';

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

type DeleteParams = { is_admin?: boolean; current_user_id?: UserId };

export const get = async <P extends FindParamsBase>(params: P) => {
    const { current_user_id, id, post_id } = params as GetParams;
    const repo = new ImageRepository();

    let postId = post_id;
    if (!postId) {
        if (!id) throw new ServiceError('Missing parameter: id or post_id');
        //get image check post access
        const image = await repo.findById(id);
        if (!image) throw new ServiceError('Image not found', ErrorCode.NOT_FOUND);
        postId = image.post_id;
    }

    const post = (await postService.get({ id: postId, current_user_id }))[0];
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
        item.url = url.toString();
        item.width = file?.width || 0;
        item.height = file?.height || 0;
    }

    return findResult;
}

export const getById = async (id: ImageId, context: { current_user_id?: UserId }) => {
    const { current_user_id } = context;
    return (await get({
        id,
        ...(current_user_id && { current_user_id }),
    }))[0];
}

export const del = async (id: ImageId, params: DeleteParams) => {
    const { is_admin, current_user_id } = params;
    if (!id) throw new ServiceError('Missing parameter: id');
    if (!is_admin && !current_user_id) throw new ServiceError('Missing parameter: current_user_id');

    //check if admin or if has access (current_user_id)
    if (!is_admin && !canDelete(id, { current_user_id: current_user_id! })) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

    const repo = new ImageRepository();
    const image = await repo.findById(id);
    if (!image) throw new ServiceError(`Image not found: ${id}`);

    //delete files first
    fileService.del(image.file_id);

    //delete record
    repo.delete(id);
}

const canDelete = async (id: ImageId, userContext: UserContext) => {
    const { current_user_id } = userContext;
    if (!current_user_id) throw new ServiceError('Missing parameter: current_user_id');
    const repo = new ImageRepository();
    const image = await repo.findById(id);
    if (!image) return false;

    const canDelete = await postService.canDelete(image.post_id, { current_user_id });

    return canDelete;
}