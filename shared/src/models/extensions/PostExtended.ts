import type { Post } from '../generated/Post';
import PostImageDetail from './PostImageDetail';

export default interface PostExtended extends Post {
    display_name: string;
    images: PostImageDetail[];
}