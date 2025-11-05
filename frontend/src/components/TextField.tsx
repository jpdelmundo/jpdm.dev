import { Collapse, TextField as MuiTextField, Stack, Typography, type TextFieldProps } from '@mui/material';

export default function TextField(props: TextFieldProps) {
    const { label, error, helperText, slotProps } = props;
    const isHelperTextCentered = slotProps && (slotProps as any).htmlInput?.sx?.textAlign == 'center';

    return (
        <Stack spacing={1} sx={{ '&>:not(style)~:not(style)': { mt: '4px' } }}>
            <Typography fontWeight="500">{label}</Typography>
            <MuiTextField
                autoComplete="off"
                {...props}
                label=""
                helperText="" />
            <Collapse in={!!helperText} timeout={300}>
                <Typography
                    color={error ? 'error.main' : 'text.secondary'}
                    sx={{ mt: '2px', ml: '14px', ...(isHelperTextCentered && { textAlign: 'center' }) }}
                >
                    {helperText}
                </Typography>
            </Collapse>
        </Stack>
    );
}
