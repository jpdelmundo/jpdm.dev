import type { Post } from '../generated/Post';
import PostImageExtended from './PostImageExtended';

export default interface PostExtended extends Post {
    display_name: string;
    images: PostImageExtended[];
}