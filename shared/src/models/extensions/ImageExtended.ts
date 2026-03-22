import type { Image } from '../generated/Image.js';
import type { UserId } from '../generated/User.js';

export default interface ImageExtended extends Image {
    user_id: UserId;
    url: string;
    width: number;
    height: number;
}