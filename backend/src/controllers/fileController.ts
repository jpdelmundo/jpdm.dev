import { createFile } from '@/services/fileService';
import type { AuthorizedRequest } from '@/types/AuthorizedRequest';
import { fail, ok } from '@/utils/apiHelper';
import type { FileInitializer } from '@shared/models/generated/File';
import type { Request, Response } from 'express';
import { fileTypeFromFile } from 'file-type';
import fs from 'fs';
import path from 'path';

export const upload = async (req: Request, res: Response): Promise<Response> => {
    const authReq = req as AuthorizedRequest;
    const file = req.file;
    if (!file) return fail(res, 'Missing upload file');

    const type = await fileTypeFromFile(file.path);
    if (!type) return fail(res, 'Cannot determine file type');

    if (!type.mime.startsWith('image/')) {
        fs.promises.unlink(file.path);
        return fail(res, 'File type not allowed');
    }

    const filepath = file.path.replace(/\\/g, '/') + path.extname(file.originalname);
    const newFile: FileInitializer = {
        user_id: authReq.user.id,
        filename: file.filename,
        orig_filename: file.originalname,
        mime_type: file.mimetype,
        path: `/${filepath}`,
        size: file.size,
        url: `/${filepath}`,
        expire_at: new Date(Date.now() + (60 * 60 * 1000))
    };
    const result = await createFile(newFile);

    return ok(res, result);
}