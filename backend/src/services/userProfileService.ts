import { ServiceError } from "@/errors/ServiceError";
import { UserProfileRepository } from "@/repositories/UserProfileRepository";
import type { FindParamsBase } from "@/types/FindParams";
import type { UserId } from "@shared/models/generated/User";
import type { UserProfileId, UserProfileInitializer, UserProfileMutator } from "@shared/models/generated/UserProfile";

type GetParams = {
    id?: UserProfileId;
    user_id?: UserId;
}

export const create = async (params: UserProfileInitializer) => {
    const { user_id } = params;
    if (!user_id) throw new ServiceError('Missing parameter: user_id');

    //create post
    const repo = new UserProfileRepository();
    const userProfile = await repo.create({ ...params });
    if (!userProfile) throw new Error(`Failed creating user profile. user_id: ${user_id}`);

    const result = (await get({ id: userProfile.id }))[0];
    if (!result) throw new Error(`User profile created but not found: ${userProfile.id}`);

    return result;
}

export const get = async <P extends FindParamsBase>(params: P) => {
    const { id, user_id } = params as GetParams;
    const repo = new UserProfileRepository();

    const findParams = {
        ...(id && { id }),
        ...(user_id && { user_id }),
    } as P;

    const findResult = await repo.find(findParams);

    return findResult;
}

export const update = async (id: UserProfileId, params: UserProfileMutator) => {
    //const { avatar_url, first_name, last_name } = params;
    if (!id) throw new ServiceError('Missing parameter: i');

    const repo = new UserProfileRepository();
    const updated = await repo.update(id, params);

    return updated;
}