import type { CollageImage } from '@/types/CollageImage';
import { styled } from '@mui/material/styles';
import type { ComponentProps } from 'react';

const StyledImg = styled('img')({
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    display: 'block',
    flex: 1,
    cursor: 'pointer'
});

type CoverImageProps = {
    image: CollageImage;
    onImageClick?: (image: CollageImage) => void
} & ComponentProps<typeof StyledImg>

export function CoverImage({ image, onImageClick, sx, ...rest }: CoverImageProps) {
    return <StyledImg
        onClick={() => onImageClick?.(image)}
        src={(image as { url: string }).url}
        sx={sx}
        {...rest}
    />
}