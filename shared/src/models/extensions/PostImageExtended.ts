import type { PostImage } from '../generated/PostImage.js';
import type { UserId } from '../generated/User.js';

export default interface PostImageExtended extends PostImage {
    user_id: UserId;
    url: string;
    width: number;
    height: number;
}