import type { PostImage } from '../generated/PostImage.js';

export default interface PostImageExtended extends PostImage {
    url: string;
    width: number;
    height: number;
}