import { Collapse, TextField as MuiTextField, Stack, Typography, type TextFieldProps } from '@mui/material';

type TextFieldPropsCustom = TextFieldProps & {
    inputTextAlign?: 'left' | 'center' | 'right';
};

export default function TextField(props: TextFieldPropsCustom) {
    const { label, error, helperText, inputTextAlign } = props;
    const isHelperTextCentered = inputTextAlign == 'center';

    return (
        <Stack spacing={1} sx={{ '&>:not(style)~:not(style)': { mt: '4px' } }}>
            <Typography fontWeight="500">{label}</Typography>
            <MuiTextField
                autoComplete="off"
                {...props}
                label=""
                helperText=""
                {...(inputTextAlign && { slotProps: { htmlInput: { sx: { textAlign: inputTextAlign } } } })} />
            <Collapse in={!!helperText} timeout={300}>
                <Typography
                    color={error ? 'error.main' : 'text.secondary'}
                    sx={{ mt: '2px', ml: '14px', ...(isHelperTextCentered && { textAlign: inputTextAlign }) }}
                >
                    {helperText}
                </Typography>
            </Collapse>
        </Stack>
    );
}
