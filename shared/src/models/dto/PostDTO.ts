import type PostImageExtended from '../extensions/PostImageExtended.js';
import type { Post } from '../generated/Post.js';

export default interface PostDTO extends Post {
    display_name: string;
    images: PostImageExtended[];
    comments_count: number;
    is_liked: boolean;
    avatar_url: string;
}