import type { PostImageId } from '@shared/models/generated/PostImage';

export interface CollageImage {
    id: PostImageId;
    url: string;
    width: number;
    height: number;
}