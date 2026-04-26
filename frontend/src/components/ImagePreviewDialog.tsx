import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useImperativeHandle, useState, type Ref } from 'react';

type Handle = {
    open: (src: string) => void;
}

type ImagePreviewDialogProps = {
    ref: Ref<Handle>;
}

export function ImagePreviewDialog({ ref }: ImagePreviewDialogProps) {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const open = Boolean(imgSrc);

    useImperativeHandle(ref, () => ({
        open: (src: string) => setImgSrc(src)
    }), []);

    return <Dialog
        open={open}
        onClose={() => setImgSrc(null)}
        maxWidth={false}
        sx={{
            '& .MuiPaper-root': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                boxShadow: 'none',
                overflow: 'visible'
            },
            '& .MuiBackdrop-root': {
                backgroundColor: '#000000dd'
            }
        }}
        transitionDuration={0}
    >
        <Stack direction={'row'} sx={{ position: 'fixed', right: '20px', top: '10px', alignItems: 'center', gap: '10px' }}>
            <Typography color="#ffffff">Esc</Typography>
            <IconButton sx={{ color: '#ffffff', backgroundColor: '#ffffff33' }} onClick={() => setImgSrc(null)}>
                <CloseIcon />
            </IconButton>
        </Stack>
        <img
            src={imgSrc || ''}
            style={{
                width: '100%',
                maxHeight: '100vh',
                objectFit: 'contain'
            }}
        />
    </Dialog>
}