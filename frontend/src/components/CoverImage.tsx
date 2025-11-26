import { styled } from '@mui/material/styles';
import type PostImageExtended from '@shared/models/extensions/PostImageExtended';
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
    image: PostImageExtended;
    onImageClick: (image: PostImageExtended) => void
} & ComponentProps<typeof StyledImg>

export function CoverImage({ image, onImageClick, sx, ...rest }: CoverImageProps) {
    return <StyledImg
        onClick={() => onImageClick(image)}
        src={image.url}
        sx={sx}
        {...rest}
    />
}