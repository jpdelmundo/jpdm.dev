import { FileRepository } from '@/repositories/FileRepository';
import type { FileInitializer } from '@shared/models/generated/File';

export const createFile = async (data: FileInitializer) => {
    const repo = new FileRepository();
    const result = await repo.create(data);

    return result;
}