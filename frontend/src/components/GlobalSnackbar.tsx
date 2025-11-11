import { useSnackbarStore } from '@/store/useSnackbarStore';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

export function GlobalSnackbar() {
    const { message, open, closeMessage, severity } = useSnackbarStore();

    return <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={closeMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeMessage} severity={severity} variant="filled" >{message}</Alert>
    </Snackbar>
}