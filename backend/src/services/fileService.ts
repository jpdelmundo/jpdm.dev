import { USERCONTENT_DIR } from '@/config/config.js';
import { ServiceError } from '@/errors/ServiceError.js';
import type { ServiceContext } from '@/infra/serviceContext.js';
import { FileRepository } from '@/repositories/FileRepository.js';
import type { KeyValue } from '@/types/KeyValue.js';
import { compress } from '@/utils/image.js';
import { isAuthenticatedUser } from '@/utils/permissions.js';
import type { FileId, FileInitializer } from '@shared/models/generated/File.js';
import { ErrorCode } from '@shared/types/ErrorCode.js';
import { createHash } from 'crypto';
import { fileTypeFromFile } from 'file-type';
import fs from 'fs';
import { imageSizeFromFile } from 'image-size/fromFile';
import path from 'path';

export const createFileService = ({ deps, actor }: ServiceContext) => {
    const get = async <P extends KeyValue>(params: P) => {
        return deps.fileRepo.find(params);
    }

    const create = async (data: FileInitializer) => {
        const repo = new FileRepository();
        const result = await repo.create(data);
        if (!result?.id) throw new ServiceError('Failed creating file record');

        return result;
    }

    const del = async (id: FileId) => {
        if (!id) throw new ServiceError('Missing parameter: id');
        const repo = new FileRepository();
        const file = await repo.findById(id);
        if (!file) throw new ServiceError(`File not found: ${id}`);

        // delete actual file
        try {
            await fs.promises.unlink(path.resolve(USERCONTENT_DIR, file.path));
        } catch (err) {
            const e = err as NodeJS.ErrnoException;
            if (e.code !== 'ENOENT') throw e;
        }

        const deleted = await repo.delete(id);
        if (!deleted?.id) throw new ServiceError(`File delete failed: ${id}`);

        return deleted;
    }

    const uploadImage = async (file: Express.Multer.File) => {
        if (!file) throw new Error('File is required');

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

        const userDir = path.posix.join('temp_upload', createHash('sha256').update(isAuthenticatedUser(actor) ? actor.id : 'system').digest('hex').slice(0, 16));
        const destDir = path.resolve(USERCONTENT_DIR, userDir);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        const dimensions = type.mime.startsWith('image/') ? await imageSizeFromFile(`${file.path}`) : null;

        // compress uploaded file
        const parsed = path.parse(file.path);
        const compressed = await compress(file.path, { format: 'webp' });
        const compressedFilename = `${parsed.name}.webp`;
        const compressedFilePath = path.posix.join(destDir, compressedFilename);
        fs.writeFileSync(compressedFilePath, compressed);
        fs.unlink(file.path, (err) => err && console.warn(`Failed to unlink temp file: ${file.path}`));

        const newFile: FileInitializer = {
            user_id: isAuthenticatedUser(actor) ? actor.id : '',
            filename: path.basename(compressedFilePath),
            orig_filename: file.originalname,
            mime_type: type.mime,
            path: path.posix.join(userDir, compressedFilename),
            size: file.size,
            expires_at: new Date(Date.now() + (60 * 60 * 1000)),
            ...(dimensions ? { width: dimensions.width, height: dimensions.height } : {})
        };

        return create(newFile);
    }

    const getById = async (file_id: FileId) => {
        const repo = new FileRepository();
        const result = await repo.findById(file_id);
        return result;
    }

    return {
        get,
        create,
        delete: del,
        uploadImage,
        getById
    };
};
