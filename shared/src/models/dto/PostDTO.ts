import type ImageExtended from '@project/shared/src/models/extensions/ImageExtended.js';
import type { Post } from '../generated/Post.js';

export default interface PostDTO extends Post {
    display_name: string;
    images: ImageExtended[];
    comments_count: number;
    is_liked: boolean;
    avatar_url: string;
}