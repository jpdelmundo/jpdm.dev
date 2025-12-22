import { createFile } from '@/services/fileService';
import type { AuthorizedRequest } from '@/types/AuthorizedRequest';
import { fail, ok } from '@/utils/apiHelper';
import type { FileInitializer } from '@shared/models/generated/File';
import type { Request, Response } from 'express';
import { fileTypeFromFile } from 'file-type';
import fs from 'fs';
import { imageSizeFromFile } from 'image-size/fromFile';

export const upload = async (req: Request, res: Response): Promise<Response> => {
    const authReq = req as AuthorizedRequest;
    const file = req.file;
    if (!file) return fail(res, 'Missing upload file');
    console.log({ file });
    const type = await fileTypeFromFile(file.path);
    if (!type) return fail(res, 'Cannot determine file type');

    if (!type.mime.startsWith('image/')) {
        try {
            await fs.promises.unlink(file.path);
        } catch (err) {
            const e = err as NodeJS.ErrnoException;
            if (e.code !== 'ENOENT') throw e;
        }

        return fail(res, 'File type not allowed');
    }

    //rename with extension
    const filepath = file.path.replace(/\\/g, '/');
    const dimensions = type.mime.startsWith('image/') ? await imageSizeFromFile(`${filepath}`) : null;
    const filepathWithExt = `${filepath}.${type.ext}`;
    const filenameWithExt = `${file.filename}.${type.ext}`;
    fs.promises.rename(filepath, filepathWithExt);

    const newFile: FileInitializer = {
        user_id: authReq.user.id,
        filename: filenameWithExt,
        orig_filename: file.originalname,
        mime_type: file.mimetype,
        path: filepathWithExt,
        size: file.size,
        expire_at: new Date(Date.now() + (60 * 60 * 1000)),
        ...(dimensions ? { width: dimensions.width, height: dimensions.height } : {})
    };
    const result = await createFile(newFile);

    return ok(res, result);
}