import ArrowCircleLeftRounded from '@mui/icons-material/ArrowCircleLeftRounded';
import ArrowCircleRightRounded from '@mui/icons-material/ArrowCircleRightRounded';
import HighlightOffRounded from '@mui/icons-material/HighlightOffRounded';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import type PostImageExtended from '@shared/models/extensions/PostImageExtended';

type PostImageDialogParams = {
    open: boolean;
    closeDialog: () => void;
    postImage: PostImageExtended | null;
    isLoading?: boolean;
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

export function PostImageDialog({ open, closeDialog, postImage, isLoading }: PostImageDialogParams) {

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
                        sx={{
                            ...buttonStyle,
                            left: '16px',
                        }}
                    ><ArrowCircleLeftRounded sx={iconStyle} /></IconButton>
                    <IconButton
                        sx={{
                            ...buttonStyle,
                            right: '16px',
                        }}
                    ><ArrowCircleRightRounded sx={iconStyle} /></IconButton>

                    {isLoading || !postImage ? <CircularProgress /> : <img src={postImage.url} />}

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