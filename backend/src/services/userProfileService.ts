import { USERCONTENT_DIR, USERCONTENT_DIR_BASENAME } from "@/config/config.js";
import { ServiceError } from "@/errors/ServiceError.js";
import type { ServiceContext } from "@/infra/serviceContext.js";
import { createFileService } from '@/services/fileService.js';
import type { KeyValue } from "@/types/KeyValue.js";
import { sign } from "@/utils/auth.js";
import { getUserAvatarDir } from "@/utils/helper.js";
import { compress } from "@/utils/image.js";
import { moderateImage, moderateName } from "@/utils/llm.js";
import { canModify as _canModify } from '@/utils/permissions.js';
import type { FileInitializer } from "@shared/models/generated/File.js";
import type { UserId } from "@shared/models/generated/User.js";
import type { UserProfile, UserProfileId, UserProfileInitializer, UserProfileMutator } from "@shared/models/generated/UserProfile.js";
import { ErrorCode } from "@shared/types/ErrorCode.js";
import { randomBytes } from "crypto";
import { fileTypeFromFile } from "file-type";
import fs from 'fs';
import { imageSizeFromFile } from "image-size/fromFile";
import path from 'path';

export const createUserProfileService = (ctx: ServiceContext) => {
    const { deps, actor } = ctx;

    const get = async <P extends KeyValue>(params: P) => {
        return deps.userProfileRepo.find(params);
    };

    const enrich = async (items: UserProfile[]) => {
        const result: UserProfile[] = [];
        const avatarFileIds = [...new Set(items.map(i => i.avatar_file_id))];
        const avatarFiles = await createFileService(ctx).get({ ids: avatarFileIds });
        const avatarFileMap = new Map(avatarFiles.map(i => [i.id, i]));

        for (const item of items) {
            let avatar_url = item.avatar_url;
            if (!avatar_url && item.avatar_file_id) {
                const avatarFile = avatarFileMap.get(item.avatar_file_id);
                const url = avatarFile ? new URL(path.posix.join(USERCONTENT_DIR_BASENAME, avatarFile.path), 'http://x') : null;
                if (url) {
                    const expires = Math.floor((Date.now() / 1000) + 900);
                    const signature = sign(`${url.pathname}:${expires}`);
                    url.searchParams.append('expires', expires.toString());
                    url.searchParams.append('signature', signature);
                    avatar_url = url.pathname + url.search;
                }
            }
            result.push({
                ...item,
                avatar_url
            });
        }

        return result;
    }

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
        if (!await canModify(id)) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

        const updated = await deps.userProfileRepo.update(id, params);

        return updated;
    };

    const updateByUserId = async (user_id: UserId, param: UserProfileMutator) => {
        const { avatar_url, bio, date_of_birth, first_name, last_name, gender, phone_number, avatar_file_id } = param;
        if (!user_id) throw new ServiceError('Missing parameter: user_id');
        if (!_canModify(actor, user_id)) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

        if (first_name || last_name) {
            const name = `${first_name} ${last_name}`;
            const moderation = await moderateName(name);
            console.log(`Moderate name: ${name}`, moderation);
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

        let [userProfile] = await get({ user_id });
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

            avatar_file_id && (params.avatar_url = null);

            userProfile = await update(userProfile.id, params);
        }

        if (!userProfile) throw new Error('Failed updating user profile by user_id');

        return userProfile;
    };

    const handleAvatarUpload = async (user_id: UserId, file: Express.Multer.File) => {
        if (!_canModify(actor, user_id)) throw new ServiceError('Unauthorized request');
        if (!user_id) throw new ServiceError('Missing required parameter: user_id');
        if (!file) throw new ServiceError('Missing required parameter: file');
        const type = await fileTypeFromFile(file.path);
        if (!type) throw new ServiceError('Cannot determine file type');

        if (!type.mime.startsWith('image/')) {
            fs.promises.unlink(path.resolve(USERCONTENT_DIR, file.path)).catch((e) => console.error(e));
            throw new ServiceError('File type not allowed', ErrorCode.NOT_ALLOWED);
        }

        //moderate
        const moderation = await moderateImage(file.path);
        if (!moderation) throw new Error('Invalid AI moderation result');
        if (!moderation.is_allowed) throw new ServiceError(`AI Moderation: ${moderation.reason}`);

        return setImageFileToUserAvatar(file.path, user_id);
    };

    const deleteAvatar = async (user_id: UserId) => {
        if (!_canModify(actor, user_id)) throw new ServiceError('Unauthorized request');
        if (!user_id) throw new ServiceError('Missing required parameter: user_id');

        await updateByUserId(user_id, { avatar_url: null });
    };

    const setImageFileToUserAvatar = async (filePath: string, user_id: UserId, options: { deleteSrc: boolean } = { deleteSrc: true }) => {
        const userDir = getUserAvatarDir(user_id);
        const destDir = path.resolve(USERCONTENT_DIR, userDir);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        //compress file
        const compressed = await compress(filePath, { format: 'webp' });
        const compressedFilename = `${randomBytes(8).toString('hex')}.webp`;
        const compressedFilePath = path.posix.join(destDir, compressedFilename);

        fs.writeFileSync(compressedFilePath, compressed);
        if (options.deleteSrc) fs.unlinkSync(filePath);

        const dimensions = await imageSizeFromFile(`${compressedFilePath}`);
        const newFile: FileInitializer = {
            user_id,
            filename: path.basename(compressedFilePath),
            orig_filename: path.basename(filePath),
            mime_type: 'image/webp',
            path: path.posix.join(userDir, compressedFilename),
            size: compressed.length,
            ...(dimensions ? { width: dimensions.width, height: dimensions.height } : {})
        };
        const avatarFile = await createFileService(ctx).create(newFile);
        await updateByUserId(user_id, { avatar_file_id: avatarFile.id });

        return avatarFile;
    }

    const canModify = async (id: UserProfileId) => {
        const userProfile = await deps.userProfileRepo.findById(id);
        if (!userProfile) return false;

        return _canModify(actor, userProfile.user_id);
    };

    return {
        get,
        create,
        update,
        updateByUserId,
        handleAvatarUpload,
        deleteAvatar,
        setImageFileToUserAvatar,
        enrich
    };
};