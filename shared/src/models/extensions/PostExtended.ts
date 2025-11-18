import type { Post } from '../generated/Post';
import PostImageDetail from './PostImageDetail';

export default interface PostExtended extends Post {
    images: PostImageDetail[];
}