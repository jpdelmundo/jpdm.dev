import { apiGet } from '@/api/apiClient';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import type PostImageExtended from '@shared/models/extensions/PostImageExtended';
import type { PostImageId } from '@shared/models/generated/PostImage';
import { useEffect, useState } from 'react';

type ImageDialogParams = {
    open: boolean;
    closeDialog: () => void;
    images?: PostImageExtended[] | null;
    imageId: PostImageId | null;
};

const buttonStyle = {
    position: 'absolute',
    top: '50%',
    color: 'white',
    opacity: 0.4,
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

export function ImageDialog({ open, closeDialog, imageId, images }: ImageDialogParams) {
    console.log('ImageDialog render', { images, imageId });
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<PostImageExtended | null>(null);
    const [imageSet, setImageSet] = useState<PostImageExtended[] | null>(images || null);
    const [controlsVisible, setControlsVisible] = useState(true);

    const getData = async ({ include_set }: { include_set?: boolean } = {}) => {
        setIsLoading(true);
        const result = await apiGet<ApiGetResult>(`/images/${imageId}`, { ...(include_set && { include_set }) });
        setIsLoading(false);
        if (result.ok && result.data) {
            setSelectedImage(result.data.post_image);
            include_set && setImageSet(result.data.post_image_set);
        }
    }

    //e: MouseEvent<HTMLButtonElement>
    const prevOnClick = () => {
        if (imageSet && selectedImage) {
            let selectedIndex = imageSet.findIndex(p => p.id == selectedImage.id) - 1;
            selectedIndex = selectedIndex < 0 ? 0 : selectedIndex;
            setSelectedImage(imageSet[selectedIndex]);
            window.history.pushState({}, '', `/images/${imageSet[selectedIndex].id}`);
        }
    }

    const nextOnClick = () => {
        if (imageSet && selectedImage) {
            let selectedIndex = imageSet.findIndex(p => p.id == selectedImage.id) + 1;
            selectedIndex = selectedIndex > imageSet.length - 1 ? imageSet.length - 1 : selectedIndex;
            console.log({ selectedIndex, id: imageSet[selectedIndex].id });
            setSelectedImage(imageSet[selectedIndex]);
            window.history.pushState({}, '', `/images/${imageSet[selectedIndex].id}`);
        }
    }

    useEffect(() => {
        if (!open) return;
        !imageSet && getData({ include_set: true });
    }, []);

    useEffect(() => {
        setImageSet(images ?? null);
    }, [images]);

    useEffect(() => {
        imageSet && setSelectedImage(imageSet[imageSet.findIndex(p => p.id == imageId)]);
    }, [imageId]);

    console.log('ImageDialog before return jsx', { isLoading, selectedImage, imageSet, images });

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
                            transform: 'translateY(-50%)',
                            display: controlsVisible ? '' : 'none'
                        }}
                    ><PlayArrowRoundedIcon sx={{ ...iconStyle, transform: 'scaleX(-1)' }} /></IconButton>
                    <IconButton
                        onClick={nextOnClick}
                        sx={{
                            ...buttonStyle,
                            right: '16px',
                            transform: 'translateY(-50%)',
                            display: controlsVisible ? '' : 'none'
                        }}
                    ><PlayArrowRoundedIcon sx={iconStyle} /></IconButton>

                    {isLoading || !selectedImage ? <CircularProgress /> : <img src={selectedImage.url} onClick={() => setControlsVisible(prev => !prev)} />}

                    <IconButton
                        onClick={closeDialog}
                        sx={{
                            ...buttonStyle,
                            top: '16px',
                            right: '16px',
                            backgroundColor: '#ff0000',
                            '&:hover': {
                                backgroundColor: '#ff0000',
                                opacity: 1
                            },
                            display: controlsVisible ? '' : 'none'
                        }}
                    ><CloseRoundedIcon sx={iconStyle} /></IconButton>
                </Box>
            </Dialog>
        </>
    );
}