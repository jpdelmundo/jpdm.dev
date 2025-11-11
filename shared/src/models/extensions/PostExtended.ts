import type { Post } from '../generated/Post';
import type { PostFile } from '../generated/PostFile';

export default interface PostExtended extends Post {
    files?: PostFile[];
}