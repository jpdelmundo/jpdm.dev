import type { AppContext } from '@/infra/appContext.js';
import { bindContext } from '@/infra/bindContext.js';
import { createFileService } from '@/services/fileService.js';
import { ok } from '@/utils/apiHelper.js';
import type { Request, Response } from 'express';

export const createFileController = (app: AppContext) => {
    const makeCtx = bindContext(app);

    return {
        uploadImage: async (req: Request, res: Response): Promise<Response> => {
            const file = req.file;
            const uploadedFile = await createFileService(makeCtx(req)).uploadImage(file!);
            return ok(res, uploadedFile);
        }
    }
};