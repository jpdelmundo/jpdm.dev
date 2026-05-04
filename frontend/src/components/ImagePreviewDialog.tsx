import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type ImagePreviewDialogProps = {
    open: boolean;
    src: string;
    onClose: () => void;
}

export function ImagePreviewDialog({ open, src, onClose }: ImagePreviewDialogProps) {

    return <Dialog
        open={open}
        onClose={onClose}
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
            <IconButton sx={{ color: '#ffffff', backgroundColor: '#ffffff33' }} onClick={onClose}>
                <CloseIcon />
            </IconButton>
        </Stack>
        <img
            src={src || ''}
            style={{
                width: '100%',
                maxHeight: '100vh',
                objectFit: 'contain'
            }}
        />
    </Dialog>
}