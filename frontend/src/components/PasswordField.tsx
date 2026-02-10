import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import type { TextFieldProps } from '@mui/material/TextField';
import { useState } from 'react';
import TextField from './TextField';

export default function PasswordField(props: TextFieldProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <TextField
            {...props}
            type={showPassword ? 'text' : 'password'}
            slotProps={{
                ...props.slotProps,
                input: {
                    ...props.slotProps?.input,
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }
            }} />
    );
}