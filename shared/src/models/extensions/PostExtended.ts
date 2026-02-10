import type { Post } from '../generated/Post.js';
import type ImageExtended from './ImageExtended.js';

export default interface PostDTO extends Post {
    display_name: string;
    images: ImageExtended[];
    comments_count: number;
    is_liked: boolean;
}