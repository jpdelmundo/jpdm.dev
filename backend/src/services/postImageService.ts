import { USERCONTENT_DIR_BASENAME } from "@/config/config.js";
import { ServiceError } from "@/errors/ServiceError.js";
import type { ServiceContext } from "@/infra/serviceContext.js";
import type { Deps } from "@/types/Deps.js";
import type { KeyValue } from "@/types/KeyValue.js";
import { sign } from "@/utils/auth.js";
import { canModify } from "@/utils/permissions.js";
import type PostImageExtended from "@shared/models/extensions/PostImageExtended.js";
import type { PostImage, PostImageId } from "@shared/models/generated/PostImage.js";
import type { EnrichOptions } from "@shared/types/EnrichOptions.js";
import { ErrorCode } from "@shared/types/ErrorCode.js";
import path from 'path';
import { createFileService } from './fileService.js';

export const createPostImageService = (ctx: ServiceContext) => {
    const { deps, actor } = ctx;

    const get = async <P extends KeyValue>(params: P) => {
        return deps.postImageRepo.find(params);
    };

    const enrich = async (items: PostImage[], options: EnrichOptions = {}): Promise<PostImageExtended[]> => {
        const { include } = options;
        const fileIds = [...new Set(items.map(i => i.file_id))];
        const files = fileIds ? await createFileService(ctx).get({ ids: fileIds }) : [];

        const fileMap = new Map(files.map(i => [i.id, i]));

        const result: PostImageExtended[] = [];
        for (const item of items) {
            const file = fileMap.get(item.file_id);
            const url = new URL(path.join(USERCONTENT_DIR_BASENAME, file?.path || ''), 'http://x');
            const expires = Math.floor((Date.now() / 1000) + 900); //15min expiration
            const signature = sign(`${url.pathname}:${expires}`);
            url.searchParams.append('expires', expires.toString());
            url.searchParams.append('signature', signature);

            result.push({
                ...item,
                url: url.pathname + url.search,
                width: file?.width || 0,
                height: file?.height || 0,
                user_id: file?.user_id || ''
            });
        }

        return result;
    };

    const getById = async (id: PostImageId) => {
        return (await get({ id }))[0];
    };

    const del = async (id: PostImageId) => {
        if (!id) throw new ServiceError('Missing parameter: id');
        const [image] = await get({ id });
        if (!image) throw new ServiceError(`Image not found: ${id}`);
        const file = await deps.fileRepo.findById(image.file_id);
        if (!file) throw new ServiceError(`File not found: ${image.file_id}`);

        if (!canModify(actor, file.user_id)) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

        const txResult = await deps.withTransaction(async (txDeps: Deps) => {
            //delete files first
            createFileService({ deps: txDeps, actor }).delete(image.file_id);

            //delete record
            txDeps.postImageRepo.delete(id);
        });
    };

    return {
        get,
        enrich,
        getById,
        delete: del
    };
};