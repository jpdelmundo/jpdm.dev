import { useSnackbarStore } from '@/store/useSnackbarStore';
import Box from '@mui/material/Box';
import Slide, { type SlideProps } from '@mui/material/Slide';

import MuiSnackbar, { type SnackbarProps } from '@mui/material/Snackbar';
import { useTheme } from '@mui/material/styles';

const SlideTransition = (props: SlideProps) => {
    return <Slide {...props} direction="down" />;
}

export function Snackbar(props: SnackbarProps) {
    const { message, open, closeMessage } = useSnackbarStore();
    const theme = useTheme();

    return <MuiSnackbar
        slots={{ transition: SlideTransition }}
        open={open}
        autoHideDuration={5000}
        onClose={closeMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        {...props}>
        <Box fontSize={'14px'}
            sx={{
                bgcolor: '#00000099',
                color: theme.palette.getContrastText('#00000099'),
                padding: '5px 10px',
                borderRadius: '16px'
            }}>{message}</Box>
    </MuiSnackbar>
}