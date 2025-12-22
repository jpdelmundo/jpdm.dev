import { ServiceError } from '@/errors/ServiceError';
import { FileRepository } from '@/repositories/FileRepository';
import type { FileId, FileInitializer } from '@shared/models/generated/File';
import fs from 'fs';

type DeleteParams = { is_admin?: boolean; current_user_id?: UserId };

export const createFile = async (data: FileInitializer) => {
    const repo = new FileRepository();
    const result = await repo.create(data);

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
        await fs.promises.unlink(file.path);
    } catch (err) {
        const e = err as NodeJS.ErrnoException;
        if (e.code !== 'ENOENT') throw e;
    }

    const deleted = await repo.delete(id);
    if (!deleted?.id) throw new ServiceError(`File delete failed: ${id}`);

    return deleted;
}