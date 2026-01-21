import { scrollbarWidthAware } from "@/utils/helper";
import type { DialogProps } from "@mui/material/Dialog";
import MuiDialog from "@mui/material/Dialog";
import { useEffect } from "react";

export const Dialog = (props: DialogProps) => {
    const { children, open, onClose, ...otherProps } = props;

    useEffect(() => {
        scrollbarWidthAware(open);
        return () => scrollbarWidthAware(false);
    }, [open]);

    return <MuiDialog
        open={open}
        fullWidth
        disableScrollLock
        transitionDuration={0}
        maxWidth="xs"
        onClose={onClose}
        {...otherProps}
    >{children}</MuiDialog>
}
