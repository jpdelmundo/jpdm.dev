import type PostImageExtended from '../extensions/PostImageExtended.js';
import type { Post } from '../generated/Post.js';

export default interface PostDTO extends Omit<Post, 'user_id'> {
    is_owner: boolean;
    display_name: string;
    images: PostImageExtended[];
    comments_count: number;
    is_liked: boolean;
    avatar_url: string;
}