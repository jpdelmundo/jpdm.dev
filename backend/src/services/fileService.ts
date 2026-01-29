import { ServiceError } from '@/errors/ServiceError';
import { FileRepository } from '@/repositories/FileRepository';
import * as fileService from '@/services/fileService';
import { checkRequiredParameter } from '@/utils/helper';
import { compress } from '@/utils/image';
import type { FileId, FileInitializer } from '@shared/models/generated/File';
import type { Actor } from '@shared/types/Actor';
import { ErrorCode } from '@shared/types/ErrorCode';
import { createHash } from 'crypto';
import { fileTypeFromFile } from 'file-type';
import fs from 'fs';
import { imageSizeFromFile } from 'image-size/fromFile';
import path from 'path';

type DeleteParams = { is_admin?: boolean; current_user_id?: UserId };

export const createFile = async (data: FileInitializer) => {
    const repo = new FileRepository();
    const result = await repo.create(data);
    if (!result?.id) throw new ServiceError('Failed creating file record');

    return result;
}

export const del = async (id: FileId, params?: DeleteParams) => {
    //const { is_admin, current_user_id } = params;
    if (!id) throw new ServiceError('Missing parameter: id');
    const repo = new FileRepository();
    const file = await repo.findById(id);
    if (!file) throw new ServiceError(`File not found: ${id}`);

    //delete actual file
    try {
        await fs.promises.unlink(path.resolve(process.env.USERCONTENT_DIR!, file.path));
    } catch (err) {
        const e = err as NodeJS.ErrnoException;
        if (e.code !== 'ENOENT') throw e;
    }

    const deleted = await repo.delete(id);
    if (!deleted?.id) throw new ServiceError(`File delete failed: ${id}`);

    return deleted;
}

export const uploadImage = async (file: Express.Multer.File, actor: Actor) => {
    checkRequiredParameter({ file, actor });

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

    //if (!canModify(post_id, actor)) throw new ServiceError('Unauthorized request');

    const userDir = path.posix.join('temp_upload', createHash('sha256').update(actor?.type == 'user' ? actor.id : 'system').digest('hex').slice(0, 24));
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

export const getById = async (file_id: FileId) => {
    const repo = new FileRepository();
    const result = await repo.findById(file_id);
    return result;
}