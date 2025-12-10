import { apiGet } from '@/api/apiClient';
import ArrowCircleLeftRounded from '@mui/icons-material/ArrowCircleLeftRounded';
import ArrowCircleRightRounded from '@mui/icons-material/ArrowCircleRightRounded';
import HighlightOffRounded from '@mui/icons-material/HighlightOffRounded';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import type ImageExtended from '@shared/models/extensions/ImageExtended';
import type { ImageId } from '@shared/models/generated/Image';
import type { PostId } from '@shared/models/generated/Post';
import { useEffect, useState } from 'react';

type ImageDialogParams = {
    open: boolean;
    closeDialog: () => void;
    postId?: PostId | null;
    imageId: ImageId | null;
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
    post_image: ImageExtended;
    post_image_set: ImageExtended[];
};

export function ImageDialog({ open, closeDialog, postId, imageId }: ImageDialogParams) {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<ImageExtended | null>(null);
    const [images, setImages] = useState<ImageExtended[] | null>(null);

    const getData = async ({ include_set }: { include_set?: boolean } = {}) => {
        setIsLoading(true);
        const result = await apiGet<ApiGetResult>(`/images/${imageId}`, { ...(include_set && { include_set }) });
        setIsLoading(false);
        if (result.ok && result.data) {
            setSelectedImage(result.data.post_image);
            include_set && setImages(result.data.post_image_set);
            console.log({ images: result.data.post_image_set });
        }
    }

    //e: MouseEvent<HTMLButtonElement>
    const prevOnClick = () => {
        if (images && selectedImage) {
            let selectedIndex = images.findIndex(p => p.id == selectedImage.id) - 1;
            selectedIndex = selectedIndex < 0 ? 0 : selectedIndex;
            setSelectedImage(images[selectedIndex]);
            window.history.pushState({}, '', `/images/${images[selectedIndex].id}`);
        }
    }

    const nextOnClick = () => {
        if (images && selectedImage) {
            let selectedIndex = images.findIndex(p => p.id == selectedImage.id) + 1;
            selectedIndex = selectedIndex > images.length - 1 ? images.length - 1 : selectedIndex;
            console.log({ selectedIndex, id: images[selectedIndex].id });
            setSelectedImage(images[selectedIndex]);
            window.history.pushState({}, '', `/images/${images[selectedIndex].id}`);
        }
    }

    useEffect(() => {
        getData({ include_set: true });
    }, [postId]);

    useEffect(() => {
        console.log({ images });
        images && setSelectedImage(images[images.findIndex(p => p.id == imageId)]);
    }, [imageId]);

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

                    {isLoading || !selectedImage ? <CircularProgress /> : <img src={selectedImage.url} />}

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