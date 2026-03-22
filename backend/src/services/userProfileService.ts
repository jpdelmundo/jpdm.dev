import { USERCONTENT_DIR, USERCONTENT_DIR_BASENAME } from "@/config/config.js";
import { ServiceError } from "@/errors/ServiceError.js";
import type { ServiceContext } from "@/infra/serviceContext.js";
import { createFileService } from '@/services/fileService.js';
import type { KeyValue } from "@/types/KeyValue.js";
import { sign } from "@/utils/auth.js";
import { compress } from "@/utils/image.js";
import { canModify as canModifyResource } from "@/utils/permissions.js";
import type { UserProfileDTO } from "@shared/models/dto/ProfileDTO.js";
import type { FileInitializer } from "@shared/models/generated/File.js";
import type { UserId } from "@shared/models/generated/User.js";
import type { UserProfileId, UserProfileInitializer, UserProfileMutator } from "@shared/models/generated/UserProfile.js";
import { ErrorCode } from "@shared/types/ErrorCode.js";
import type { Moderation } from "@shared/types/Moderation.js";
import crypto from 'crypto';
import { fileTypeFromFile } from "file-type";
import fs from 'fs';
import { imageSizeFromFile } from "image-size/fromFile";
import OpenAI from "openai";
import path from 'path';
import { moderate } from './userService.js';

export const createUserProfileService = (ctx: ServiceContext) => {
    const { deps, actor } = ctx;

    const get = async <P extends KeyValue>(params: P) => {
        const findResult = await deps.userProfileRepo.find(params);
        const items = ('page_items' in findResult ? findResult.page_items : findResult) as UserProfileDTO[];
        for (const item of items) {
            if (item.avatar_url?.includes(path.posix.join(USERCONTENT_DIR_BASENAME, 'avatars'))) {
                const url = new URL(item.avatar_url);
                const expires = Math.floor((Date.now() / 1000) + 900); //15min expiration
                const signature = sign(`${url.pathname}:${expires}`);
                url.searchParams.append('expires', expires.toString());
                url.searchParams.append('signature', signature);
                item.avatar_url = url.toString();
            }
        }

        return findResult;
    };

    const create = async (params: UserProfileInitializer) => {
        const { user_id } = params;
        if (!user_id) throw new ServiceError('Missing parameter: user_id');

        //create post
        const userProfile = await deps.userProfileRepo.create({ ...params });
        if (!userProfile) throw new Error(`Failed creating user profile. user_id: ${user_id}`);

        const result = (await get({ id: userProfile.id }))[0];
        if (!result) throw new Error(`User profile created but not found: ${userProfile.id}`);

        return result;
    };

    const update = async (id: UserProfileId, params: UserProfileMutator) => {
        if (!id) throw new ServiceError('Missing parameter: id');

        const updated = await deps.userProfileRepo.update(id, params);

        return updated;
    };

    const updateByUserId = async (user_id: UserId, param: UserProfileMutator) => {
        if (!canModify(user_id)) throw new ServiceError('Unauthorized request');
        if (!user_id) throw new ServiceError('Missing parameter: user_id');
        const { avatar_url, bio, date_of_birth, first_name, last_name, gender, phone_number, avatar_file_id } = param;

        if (first_name || last_name) {
            const name = `${first_name} ${last_name}`;
            const moderation = await moderate(name);
            console.log({ moderation });
            if (!moderation) throw new Error('Invalid AI moderation result');
            if (!moderation.is_allowed) throw new ServiceError(`AI Moderation: ${moderation.reason}`);
        }

        const params = {
            ...(avatar_url !== undefined && { avatar_url }),
            ...(avatar_file_id !== undefined && { avatar_file_id }),
            ...(bio !== undefined && { bio }),
            ...(date_of_birth !== undefined && { date_of_birth: date_of_birth || null }),
            ...(first_name !== undefined && { first_name }),
            ...(last_name !== undefined && { last_name }),
            ...(gender !== undefined && { gender: gender || null }),
            ...(phone_number !== undefined && { phone_number }),
        };

        let userProfile = (await get({ user_id }))[0];
        if (!userProfile) {
            userProfile = await create({
                user_id,
                ...params
            });
        } else {
            //if avatar_url is being updated and user has existing avatar, delete avatar file
            if ((avatar_url || avatar_url === null) && userProfile.avatar_file_id) {
                await createFileService(ctx).delete(userProfile.avatar_file_id);
                avatar_url === null && (params.avatar_file_id = null);
            }

            userProfile = await update(userProfile.id, params);
        }

        if (!userProfile) throw new Error('Failed updating user profile by user_id');

        return userProfile;
    };

    const updateAvatar = async (user_id: UserId, file: Express.Multer.File) => {
        if (!canModify(user_id)) throw new ServiceError('Unauthorized request');
        if (!user_id) throw new ServiceError('Missing required parameter: user_id');
        if (!file) throw new ServiceError('Missing required parameter: file');
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

        const userDir = path.posix.join('avatars', crypto.createHash('sha256').update(user_id).digest('hex').slice(0, 16));
        const destDir = path.resolve(USERCONTENT_DIR, userDir);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        const dimensions = type.mime.startsWith('image/') ? await imageSizeFromFile(`${file.path}`) : null;

        //compress uploaded file
        const parsed = path.parse(file.path);
        const compressed = await compress(file.path, { format: 'webp' });

        const base64Image = compressed.toString('base64');
        const moderation = await moderateImage(base64Image);
        if (!moderation) throw new Error('Invalid AI moderation result');
        if (!moderation.is_allowed) throw new ServiceError(`AI Moderation: ${moderation.reason}`);

        const compressedFilename = `${parsed.name}.webp`;
        const compressedFilePath = path.posix.join(destDir, compressedFilename);
        fs.writeFileSync(compressedFilePath, compressed);
        fs.unlinkSync(file.path);

        const newFile: FileInitializer = {
            user_id,
            filename: path.basename(compressedFilePath),
            orig_filename: file.originalname,
            mime_type: type.mime,
            path: path.posix.join(userDir, compressedFilename),
            size: file.size,
            expires_at: new Date(Date.now() + (60 * 60 * 1000)),
            ...(dimensions ? { width: dimensions.width, height: dimensions.height } : {})
        };
        const avatarFile = await createFileService(ctx).create(newFile);
        const avatar_url = `${USERCONTENT_DIR_BASENAME}/${avatarFile.path}`;
        await updateByUserId(user_id, { avatar_url, avatar_file_id: avatarFile.id });

        return avatarFile;
    };

    const deleteAvatar = async (user_id: UserId) => {
        if (!canModify(user_id)) throw new ServiceError('Unauthorized request');
        if (!user_id) throw new ServiceError('Missing required parameter: user_id');

        await updateByUserId(user_id, { avatar_url: null });
    };

    const canModify = (user_id: UserId) => {
        return canModifyResource(actor, user_id);
    };

    const moderateImage = async (base64Image: string): Promise<Moderation | null> => {
        const llm = new OpenAI({
            apiKey: process.env.LITELLM_VIRTUAL_KEY,
            baseURL: process.env.LITELLM_API_BASE_URL
        });

        const result = await llm.chat.completions.create({
            model: 'vision-model',
            messages: [
                {
                    role: 'system',
                    content: `You are an image moderation system for avatar uploads.

Analyze the uploaded image and respond ONLY with valid JSON with properties:
- is_allowed: boolean
- reason: string

Disallow:
- Nudity or sexually explicit content
- Violence or graphic content
- Hate symbols or extremist content
- Illegal activities
- Harassment or offensive gestures
- Shocking or disturbing imagery
- Spam images (ads, QR codes, promotional graphics, contact info, URLs)

Rules:
- If is_allowed = true, set "reason" to an empty string.
- If is_allowed = false, clearly and concisely explain why the image is not allowed.
- Do NOT describe the person's physical traits.
- Do NOT mention the moderation rules in the output.`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: ''
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/webp;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            temperature: 0,
            response_format: { type: "json_object" }
        });

        const content = result.choices[0]?.message.content;

        return content ? JSON.parse(content) : null;
    };

    return {
        get,
        create,
        update,
        updateByUserId,
        updateAvatar,
        deleteAvatar
    };
};