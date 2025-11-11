import type { PostInitializer } from '@shared/models/generated/Post';
import type { PostFile } from '@shared/models/generated/PostFile';

export const create = (post: PostInitializer, { files }: { files?: PostFile[] }) => {

    return {};
    //return { id: crypto.randomUUID(), content: '', title: '', created_at: new Date(), updated_at: null } as PostExtended;
}