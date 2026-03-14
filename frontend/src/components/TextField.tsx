import { type TextFieldProps } from '@mui/material/TextField';

import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import MuiTextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

type TextFieldPropsCustom = TextFieldProps & {
    inputTextAlign?: 'left' | 'center' | 'right';
    labelInputGap?: string | number;
};

export default function TextField(props: TextFieldPropsCustom) {
    const { label, error, helperText, inputTextAlign, labelInputGap } = props;
    const isHelperTextCentered = inputTextAlign == 'center';

    return <Stack gap={labelInputGap ?? '0'}>
        <Typography fontWeight="500">{label}</Typography>
        <MuiTextField
            autoComplete="off"
            {...props}
            label=""
            helperText=""
            {...(inputTextAlign && { slotProps: { htmlInput: { sx: { textAlign: inputTextAlign } } } })} />
        <Collapse in={!!helperText} timeout={300} className="helper-text-container" sx={{ mt: helperText ? '' : '0 !important' }}>
            <Typography
                className="helper-text"
                color={error ? 'error.main' : 'text.secondary'}
                sx={{ mt: '2px', ml: '14px', ...(isHelperTextCentered && { textAlign: inputTextAlign }) }}
            >
                {helperText}
            </Typography>
        </Collapse>
    </Stack>
}
