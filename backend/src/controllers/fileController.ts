import { createFile } from '@/services/fileService';
import type { AuthorizedRequest } from '@/types/AuthorizedRequest';
import { fail, ok } from '@/utils/apiHelper';
import type { FileInitializer } from '@shared/models/generated/File';
import crypto from 'crypto';
import type { Request, Response } from 'express';
import { fileTypeFromFile } from 'file-type';
import fs from 'fs';
import { imageSizeFromFile } from 'image-size/fromFile';
import path from 'path';

export const uploadImage = async (req: Request, res: Response): Promise<Response> => {
    const authReq = req as AuthorizedRequest;
    const file = req.file;
    if (!file) return fail(res, 'Missing upload file');
    console.trace({ file });
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

    const userDir = path.join('images', crypto.createHash('sha256').update(authReq.user.id).digest('hex').slice(-6));
    const destDir = path.resolve(process.env.USERCONTENT_DIR!, userDir);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    const dimensions = type.mime.startsWith('image/') ? await imageSizeFromFile(`${file.path}`) : null;

    //rename with extension
    const filenameWithExt = `${file.filename}.${type.ext}`;
    const destFile = path.posix.join(destDir, filenameWithExt);
    console.log({ 'file.path': file.path, destFile });
    fs.copyFileSync(file.path, destFile);
    fs.unlinkSync(file.path);

    const newFile: FileInitializer = {
        user_id: authReq.user.id,
        filename: path.basename(destFile),
        orig_filename: file.originalname,
        mime_type: type.mime,
        path: path.posix.join(userDir, filenameWithExt),
        size: file.size,
        expires_at: new Date(Date.now() + (60 * 60 * 1000)),
        ...(dimensions ? { width: dimensions.width, height: dimensions.height } : {})
    };
    const result = await createFile(newFile);

    return ok(res, result);
}