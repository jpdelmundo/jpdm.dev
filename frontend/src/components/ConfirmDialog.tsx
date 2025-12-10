import { useConfirmStore } from "@/store/useConfirmStore";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useEffect } from "react";

export function ConfirmDialog() {
    const {
        open,
        title,
        message,
        confirmText,
        cancelText,
        onConfirm,
        onCancel,
    } = useConfirmStore();

    useEffect(() => {
        const hasScrollbar = document.documentElement.scrollHeight > window.innerHeight;
        hasScrollbar && document.documentElement.classList.toggle('confirm-dialog-open', open);
    }, [open]);

    return <Dialog
        open={open}
        onClose={onCancel}
        transitionDuration={0}
        fullWidth
        disableScrollLock
        maxWidth="xs"
    >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{message}</DialogContent>
        <DialogActions sx={{ padding: '25px' }}>
            <Button onClick={onCancel}>{cancelText}</Button>
            <Button onClick={onConfirm} variant="contained">{confirmText}</Button>
        </DialogActions>
    </Dialog>
}