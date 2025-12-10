import type { Post } from '../generated/Post';
import type ImageExtended from './ImageExtended';

export default interface PostDTO extends Post {
    display_name: string;
    images: ImageExtended[];
    comments_count: number;
    is_liked: boolean;
}