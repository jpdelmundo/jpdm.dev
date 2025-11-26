import type { PostImage } from '../generated/PostImage';

export default interface PostImageExtended extends PostImage {
    url: string;
    width: number;
    height: number;
}