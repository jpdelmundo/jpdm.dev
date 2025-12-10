import type { Image } from '../generated/Image';

export default interface ImageExtended extends Image {
    url: string;
    width: number;
    height: number;
}