import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { ImageOrientation } from '@shared/types/ImageOrientation';
import { CoverImage } from './CoverImage';

type Image = {
    url: string;
    width: number;
    height: number;
}

type ImageCollageParams = {
    orientation: ImageOrientation
    images: Image[];
};

export function ImageCollage({ orientation, images }: ImageCollageParams) {
    return (
        <>
            {images.length == 1 && (
                <Stack maxHeight={550} justifyContent="center" overflow="hidden">
                    <CoverImage src={images[0].url} />
                </Stack>
            )}

            {images.length == 2 && (
                <Stack direction={orientation == 'landscape' ? 'column' : 'row'} gap="2px" height={470} justifyContent="center" overflow="hidden">
                    <Box sx={{ minHeight: 0, flex: 1 }}>
                        <CoverImage src={images[0].url} />
                    </Box>
                    <Box sx={{ minHeight: 0, flex: 1 }}>
                        <CoverImage src={images[1].url} />
                    </Box>
                </Stack>
            )}

            {images.length == 3 && (
                <Stack direction={orientation == 'landscape' ? 'column' : 'row'} gap="2px" height={470} justifyContent="center" overflow="hidden">
                    <Stack sx={{ flex: 1 }}>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[0].url} />
                        </Box>
                    </Stack>
                    <Stack gap="2px" direction={orientation == 'landscape' ? 'row' : 'column'} sx={{ flex: 1 }}>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[1].url} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[2].url} />
                        </Box>
                    </Stack>
                </Stack>
            )}

            {images.length == 4 && (
                <Stack direction={orientation == 'landscape' ? 'column' : 'row'} gap="2px" height={470}>
                    <Stack gap="2px" direction={orientation == 'landscape' ? 'row' : 'column'} sx={{ flex: 1 }} justifyContent="center" overflow="hidden">
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[0].url} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[1].url} />
                        </Box>
                    </Stack>
                    <Stack gap="2px" direction={orientation == 'landscape' ? 'row' : 'column'} sx={{ flex: 1 }} justifyContent="center" overflow="hidden">
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[2].url} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[3].url} />
                        </Box>
                    </Stack>
                </Stack>
            )}

            {images.length == 5 && (
                <Stack direction={orientation == 'landscape' ? 'column' : 'row'} gap="2px" height={470}>
                    <Stack gap="2px" direction={orientation == 'landscape' ? 'row' : 'column'} sx={{ flex: orientation == 'landscape' ? 1.3 : 1 }} justifyContent="center" overflow="hidden">
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[0].url} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[1].url} />
                        </Box>
                    </Stack>
                    <Stack gap="2px" direction={orientation == 'landscape' ? 'row' : 'column'} sx={{ flex: 1 }} justifyContent="center" overflow="hidden">
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[2].url} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[3].url} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[4].url} />
                        </Box>
                    </Stack>
                </Stack>
            )}

            {images.length > 5 && (
                <Stack direction={orientation == 'landscape' ? 'column' : 'row'} gap="2px" height={470}>
                    <Stack gap="2px" direction={orientation == 'landscape' ? 'row' : 'column'} sx={{ flex: orientation == 'landscape' ? 1.3 : 1 }} justifyContent="center" overflow="hidden">
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[0].url} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[1].url} />
                        </Box>
                    </Stack>
                    <Stack gap="2px" direction={orientation == 'landscape' ? 'row' : 'column'} sx={{ flex: 1 }} justifyContent="center" overflow="hidden">
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[2].url} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }}>
                            <CoverImage src={images[3].url} />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 1 }} position="relative">
                            <CoverImage src={images[4].url} />
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
}