import type { PostImage } from '../generated/PostImage';

export default interface PostImageDetail extends PostImage {
    url: string;
    width: number;
    height: number;
}