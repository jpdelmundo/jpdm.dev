import { getDimensionOrientation, getRelativeTime } from '@/utils/helper';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type PostExtended from '@shared/models/extensions/PostExtended';
import type PostImageExtended from '@shared/models/extensions/PostImageExtended';
import type { ImageOrientation } from '@shared/types/ImageOrientation';
import { useState } from 'react';
import { ImageCollage } from './ImageCollage';
import { PostImageDialog } from './PostImageDialog';

type PostProps = {
    post: PostExtended;
};

// type Image = {
//     url: string;
//     width: number;
//     height: number;
//     id?: PostImageId;
// }

export function Post({ post }: PostProps) {
    const { title, content, images, display_name, created_at } = post;
    let orientation: ImageOrientation = 'portrait';
    const [postImageDialogOpen, setPostImageDialogOpen] = useState(false);
    const closePostImageDialog = () => {
        setPostImageDialogOpen(false);
        window.history.back();
    };
    const [selectedImage, setSelectedImage] = useState<PostImageExtended | null>(null);

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

    const onImageClick = (image: PostImageExtended) => {
        setSelectedImage(image);
        setPostImageDialogOpen(true);
        window.history.pushState({}, '', `/posts/images/${image.id}`);
    }

    return (
        <>
            <Paper className="post" elevation={0}>
                {title && <Typography className="title"  {...(title.length <= 150 && { fontSize: { xs: '30px', md: '40px' } })}>{title}</Typography>}
                <Stack direction={'row'} className="header">
                    <Avatar>{display_name.charAt(0).toUpperCase()}</Avatar>
                    <Box className="user-date-box">
                        <Typography className="user">{display_name}</Typography>
                        <Typography className="date">{getRelativeTime(String(created_at))}</Typography>
                    </Box>
                </Stack>
                <Box
                    display={images.length == 0 ? 'none' : 'block'}
                    borderRadius={1}
                    overflow="hidden"
                >
                    <ImageCollage orientation={orientation} images={images} onImageClick={onImageClick} />
                </Box>
                <Typography className="content" {...(content.length <= 50 && { fontSize: { xs: '20px', md: '30px' } })}>{content}</Typography>
            </Paper>

            <PostImageDialog
                open={postImageDialogOpen}
                closeDialog={closePostImageDialog}
                postImage={selectedImage}
            />
        </>
    );
}