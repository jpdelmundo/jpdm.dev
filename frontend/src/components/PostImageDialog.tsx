import { apiGet } from '@/api/apiClient';
import ArrowCircleLeftRounded from '@mui/icons-material/ArrowCircleLeftRounded';
import ArrowCircleRightRounded from '@mui/icons-material/ArrowCircleRightRounded';
import HighlightOffRounded from '@mui/icons-material/HighlightOffRounded';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import PostImageExtended from '@shared/models/extensions/PostImageExtended';
import type { PostId } from '@shared/models/generated/Post';
import type { PostImageId } from '@shared/models/generated/PostImage';
import { useEffect, useState, type MouseEvent } from 'react';

type PostImageDialogParams = {
    open: boolean;
    closeDialog: () => void;
    postId?: PostId | null;
    postImageId: PostImageId | null;
};

const buttonStyle = {
    position: 'absolute',
    top: '50%',
    color: 'white',
    opacity: 0.5,
    '&:hover': {
        opacity: 0.8
    }
};

const iconStyle = {
    width: 60,
    height: 60,
};

type ApiGetResult = {
    post_image: PostImageExtended;
    post_image_set: PostImageExtended[];
};

export function PostImageDialog({ open, closeDialog, postId, postImageId }: PostImageDialogParams) {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPostImage, setSelectedPostImage] = useState<PostImageExtended | null>(null);
    const [images, setImages] = useState<PostImageExtended[] | null>(null);

    const getData = async ({ include_set }: { include_set?: boolean } = {}) => {
        setIsLoading(true);
        const result = await apiGet<ApiGetResult>(`/posts/images/${postImageId}`, { ...(include_set && { include_set }) });
        setIsLoading(false);
        if (result.ok && result.data) {
            setSelectedPostImage(result.data.post_image);
            include_set && setImages(result.data.post_image_set);
            console.log({ images: result.data.post_image_set });
        }
    }

    const prevOnClick = (e: MouseEvent<HTMLButtonElement>) => {
        if (images && selectedPostImage) {
            let selectedIndex = images.findIndex(p => p.id == selectedPostImage.id) - 1;
            selectedIndex = selectedIndex < 0 ? 0 : selectedIndex;
            setSelectedPostImage(images[selectedIndex]);
            window.history.pushState({}, '', `/posts/images/${images[selectedIndex].id}`);
        }
    }

    const nextOnClick = (e: MouseEvent<HTMLButtonElement>) => {
        if (images && selectedPostImage) {
            let selectedIndex = images.findIndex(p => p.id == selectedPostImage.id) + 1;
            selectedIndex = selectedIndex > images.length - 1 ? images.length - 1 : selectedIndex;
            console.log({ selectedIndex, id: images[selectedIndex].id });
            setSelectedPostImage(images[selectedIndex]);
            window.history.pushState({}, '', `/posts/images/${images[selectedIndex].id}`);
        }
    }

    useEffect(() => {
        console.log({ postImageId });
        getData({ include_set: true });
    }, [postId]);

    useEffect(() => {
        console.log({ images });
        images && setSelectedPostImage(images[images.findIndex(p => p.id == postImageId)]);
    }, [postImageId]);

    return (
        <>
            <Dialog
                transitionDuration={0}
                open={open}
                onClose={closeDialog}
                className={'post-image-dialog'}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', height: '100vh' }}>
                    <IconButton
                        onClick={prevOnClick}
                        sx={{
                            ...buttonStyle,
                            left: '16px',
                            transform: 'translateY(-50%)'
                        }}
                    ><ArrowCircleLeftRounded sx={iconStyle} /></IconButton>
                    <IconButton
                        onClick={nextOnClick}
                        sx={{
                            ...buttonStyle,
                            right: '16px',
                            transform: 'translateY(-50%)'
                        }}
                    ><ArrowCircleRightRounded sx={iconStyle} /></IconButton>

                    {isLoading || !selectedPostImage ? <CircularProgress /> : <img src={selectedPostImage.url} />}

                    <IconButton
                        onClick={closeDialog}
                        sx={{
                            ...buttonStyle,
                            top: '16px',
                            right: '16px',
                            color: 'white'
                        }}
                    ><HighlightOffRounded sx={iconStyle} /></IconButton>
                </Box>
            </Dialog>
        </>
    );
}