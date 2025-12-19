import type { CollageImage } from '@/types/CollageImage';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { ImageOrientation } from '@shared/types/ImageOrientation';
import { memo } from 'react';
import { CoverImage } from './CoverImage';

type ImageCollageProps = {
    orientation: ImageOrientation
    images: CollageImage[];
    onImageClick?: (image: CollageImage) => void
};

export const ImageCollage = memo(({ orientation, images, onImageClick }: ImageCollageProps) => {
    const theme = useTheme();

    return (
        <>
            {images.length == 1 && (
                <Stack maxHeight={700} justifyContent="center" overflow="hidden">
                    <CoverImage onImageClick={onImageClick} image={images[0]} sx={{ maxHeight: 700, objectFit: 'contain' }} />
                </Stack>
            )}

            {images.length == 2 && (
                <Stack direction={orientation == 'landscape' ? 'column' : 'row'} gap="2px" justifyContent="center" sx={{ aspectRatio: 1.11 }}>
                    <Box sx={{ minHeight: 0, flex: 1, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex' }} >
                        <CoverImage onImageClick={onImageClick} image={images[0]} />
                    </Box>
                    <Box sx={{ minHeight: 0, flex: 1, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex' }} >
                        <CoverImage onImageClick={onImageClick} image={images[1]} />
                    </Box>
                </Stack>
            )}

            {images.length == 3 && (
                <Stack direction={orientation == 'landscape' ? 'column' : 'row'} gap="2px" sx={{ aspectRatio: 1.11 }}>
                    <Stack gap="2px" direction={orientation == 'landscape' ? 'row' : 'column'} sx={{ flex: 1 }} justifyContent="center" overflow="hidden">
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[0]} />
                        </Box>
                    </Stack>
                    <Stack gap="2px" direction={orientation == 'landscape' ? 'row' : 'column'} sx={{ flex: 1 }} justifyContent="center" overflow="hidden">
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[1]} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[2]} />
                        </Box>
                    </Stack>
                </Stack>
            )}

            {images.length == 4 && (
                <Stack direction={orientation == 'landscape' ? 'column' : 'row'} gap="2px" sx={{ aspectRatio: 1.11 }}>
                    <Stack gap="2px" direction={orientation == 'landscape' ? 'row' : 'column'} sx={{ flex: 1 }} justifyContent="center" overflow="hidden">
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[0]} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[1]} />
                        </Box>
                    </Stack>
                    <Stack gap="2px" direction={orientation == 'landscape' ? 'row' : 'column'} sx={{ flex: 1 }} justifyContent="center" overflow="hidden">
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[2]} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[3]} />
                        </Box>
                    </Stack>
                </Stack>
            )}

            {images.length == 5 && (
                <Stack
                    direction={orientation == 'landscape' ? 'column' : 'row'}
                    gap="2px"
                    sx={{
                        [theme.breakpoints.down('sm')]: {
                            aspectRatio: orientation == 'landscape' ? '4 / 4' : '4 / 3'
                        },
                        [theme.breakpoints.up('sm')]: {
                            aspectRatio: 1.11
                        },
                    }}
                >
                    <Stack gap="2px" direction={orientation == 'landscape' ? 'row' : 'column'} sx={{ flex: orientation == 'landscape' ? 1.6 : 1.3 }} justifyContent="center" overflow="hidden">
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[0]} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[1]} />
                        </Box>
                    </Stack>
                    <Stack gap="2px" direction={orientation == 'landscape' ? 'row' : 'column'} sx={{ flex: 1 }} justifyContent="center" overflow="hidden">
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[2]} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[3]} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[4]} />
                        </Box>
                    </Stack>
                </Stack>
            )}

            {images.length > 5 && (
                <Stack
                    direction={orientation == 'landscape' ? 'column' : 'row'}
                    gap="2px"
                    sx={{
                        [theme.breakpoints.down('sm')]: {
                            aspectRatio: orientation == 'landscape' ? '4 / 4' : '4 / 3'
                        },
                        [theme.breakpoints.up('sm')]: {
                            aspectRatio: 1.11
                        },
                    }}
                >
                    <Stack gap="2px" direction={orientation == 'landscape' ? 'row' : 'column'} sx={{ flex: orientation == 'landscape' ? 1.6 : 1.3 }} justifyContent="center" overflow="hidden">
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[0]} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[1]} />
                        </Box>
                    </Stack>
                    <Stack gap="2px" direction={orientation == 'landscape' ? 'row' : 'column'} sx={{ flex: 1 }} justifyContent="center" overflow="hidden">
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[2]} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage onImageClick={onImageClick} image={images[3]} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }} position="relative">
                            <CoverImage onImageClick={onImageClick} image={images[4]} />
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#00000066',
                                zIndex: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: '#ffffff',
                                fontSize: '50px'
                            }}>+{images.length - 5}</div>
                        </Box>
                    </Stack>
                </Stack>
            )}
        </>
    );
});