import { ServiceError } from "@/errors/ServiceError.js";
import type { ServiceContext } from "@/infra/serviceContext.js";
import type { KeyValue } from "@/types/KeyValue.js";
import { sign } from "@/utils/auth.js";
import { checkRequiredParameter } from "@/utils/helper.js";
import type ImageExtended from "@shared/models/extensions/ImageExtended.js";
import type { Image, ImageId } from "@shared/models/generated/Image.js";
import type { PostId } from "@shared/models/generated/Post.js";
import type { UserId } from "@shared/models/generated/User.js";
import type { EnrichOptions } from "@shared/types/EnrichOptions.js";
import { ErrorCode } from "@shared/types/ErrorCode.js";
import path from 'path';
import { createFileService } from './fileService.js';
import { createPostService } from './postService.js';

type GetParams = {
    current_user_id?: UserId;
    id?: ImageId;
    post_id?: PostId;
    post_ids?: PostId[];
    // user_id?: UserId;
    // page_num?: number;
    // page_size?: number;
    // order_by?: string;
    // order_dir?: OrderDirection;
    //skip_access_check?: boolean;
}

export const createImageService = (ctx: ServiceContext) => {
    const { deps, actor } = ctx;

    const get = async <P extends KeyValue>(params: P) => {
        const { id, post_id, post_ids } = params as GetParams;

        const findParams = {
            ...(id && { id }),
            ...(post_id && { post_id }),
            ...(post_ids && { post_ids })
        } as P;

        const findResult = await deps.imageRepo.find(findParams);

        return findResult;
    };

    const enrich = async (items: Image[], options: EnrichOptions = {}): Promise<ImageExtended[]> => {
        const { include } = options;
        const fileIds = [...new Set(items.map(i => i.file_id))];
        const files = fileIds ? await createFileService(ctx).get({ ids: fileIds }) : [];

        const fileMap = new Map(files.map(i => [i.id, i]));

        const result: ImageExtended[] = [];
        for (const item of items) {
            const file = fileMap.get(item.file_id);
            const url = new URL(path.posix.join(process.env.USERCONTENT_DIR!, file?.path || ''), process.env.STATIC_SERVER);
            const expires = Math.floor((Date.now() / 1000) + 900); //15min expiration
            const signature = sign(`${url.pathname}:${expires}`);
            url.searchParams.append('expires', expires.toString());
            url.searchParams.append('signature', signature);

            result.push({
                ...item,
                url: url.toString(),
                width: file?.width || 0,
                height: file?.height || 0
            });
        }

        return result;
    };

    const getById = async (id: ImageId) => {
        return (await get({ id }))[0];
    };

    const del = async (id: ImageId) => {
        if (!id) throw new ServiceError('Missing parameter: id');

        //check if admin or if has access (current_user_id)
        if (!canDelete(id)) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

        const image = await deps.imageRepo.findById(id);
        if (!image) throw new ServiceError(`Image not found: ${id}`);

        //delete files first
        createFileService(ctx).delete(image.file_id);

        //delete record
        deps.imageRepo.delete(id);
    };

    const canDelete = (id: ImageId): Promise<boolean> => {
        checkRequiredParameter({ id, actor });
        return (async () => {
            const image = await deps.imageRepo.findById(id);
            if (!image) return false;

            const canDelete = await createPostService(ctx).canModify(image.post_id);
            return canDelete;
        })();
    };

    return {
        get,
        enrich,
        getById,
        delete: del
    };
};