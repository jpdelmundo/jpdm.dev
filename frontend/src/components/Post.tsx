import { getDimensionOrientation } from '@/utils/helper';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type PostExtended from '@shared/models/extensions/PostExtended';
import type { ImageOrientation } from '@shared/types/ImageOrientation';
import { ImageCollage } from './ImageCollage';

export function Post({ post }: { post: PostExtended }) {
    const { title, content, images } = post;
    let orientation: ImageOrientation = 'portrait';

    if (images && images.length > 0) {
        const img = images[0];
        if (images.length < 4) {
            orientation = getDimensionOrientation(img.width, img.height);
        } else {
            const orientationCount: Record<ImageOrientation, number> = { landscape: 0, portrait: 0, square: 0, unknown: 0 };
            for (let i = 0; i < 5; i++) {
                const imgOrientation = getDimensionOrientation(img.width, img.height);
                (imgOrientation == 'landscape' || imgOrientation == 'portrait') && orientationCount[imgOrientation]++;
            }
            orientation = Object.entries(orientationCount).sort((a, b) => b[1] - a[1])[0][0] as ImageOrientation;
            //if more of portrait, flex direction = column (the second row will contain portrait images)
            //if more of landscape, flex direction = row (the second row will contain landscape images)
            orientation = orientation == 'portrait' ? 'landscape' : 'portrait';
        }
    }

    return (
        <Paper>
            {title && <Typography>{title}</Typography>}
            <Typography>{content}</Typography>
            <Box
                display={images.length == 0 ? 'none' : 'block'}
                borderRadius={1}
                overflow="hidden"
                mt={1}
            >
                <ImageCollage orientation={orientation} images={images} />
            </Box>
        </Paper>
    );
}