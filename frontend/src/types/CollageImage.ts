import type { ImageId } from '@shared/models/generated/Image';

export interface CollageImage {
    id: ImageId;
    url: string;
    width: number;
    height: number;
}