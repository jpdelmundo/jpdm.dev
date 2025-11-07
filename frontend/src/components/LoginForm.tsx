import { useFormValidation, type ValidationRuleFunction } from '@/hooks/useFormValidation';
import { fieldErrorProps, getErrorMessage } from '@/utils/helper';
import { Box, Button, Checkbox, FormControlLabel, Typography } from '@mui/material';
import type { AccessToken } from '@shared/types/AccessToken';
import type { ApiResult } from '@shared/types/ApiResult';
import { useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import PasswordField from './PasswordField';
import TextField from './TextField';

export type FormData = { username: string, password: string };

export function LoginForm({ onSubmit, onLoginSuccess }: {
    onSubmit: (formData: FormData) => Promise<ApiResult<AccessToken>>,
    onLoginSuccess: (result: ApiResult<AccessToken>) => void
}) {
    console.log('LoginForm rendered at:', new Date().toISOString());
    //const formDataRef = useRef<FormData>(Object.fromEntries(Object.keys({} as FormData).map(key => [key, ''])) as FormData);
    const formDataRef = useRef<FormData>({ username: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const validationRules: Record<keyof FormData, ValidationRuleFunction> = {
        username: (value: string) => {
            if (!value.trim()) return 'Username required';
            return '';
        },
        password: (value: string) => {
            if (!value.trim()) return 'Password required';
            return '';
        }
    };

    const { errors, validateField, validateForm, setErrors } = useFormValidation(validationRules);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, type, checked, value } = e.target;
        formDataRef.current = {
            ...formDataRef.current,
            [name]: type == 'checkbox' ? checked : value
        };
        console.log({ formDataRef, target: e.target });
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        if (!isSubmitted) return;
        const { name, value } = e.target;
        validateField(name as keyof FormData, value);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        if (!validateForm(formDataRef.current) || isLoading) return;
        console.log("Form submitted with data:", formDataRef.current);

        setErrorMessage('');
        setIsLoading(true);

        const result = await onSubmit(formDataRef.current);
        setIsLoading(false);

        if (result.ok) {
            onLoginSuccess(result);
        } else {
            setErrorMessage(getErrorMessage(result));
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <Box display="flex" flexDirection="column" gap={1}>
                <Box minHeight="1.5em">
                    {errorMessage && (
                        <Typography color="error" variant="body2" >{errorMessage}</Typography>
                    )}
                </Box>
                <div>
                    <TextField name="username"
                        label="Username"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        fullWidth
                        {...fieldErrorProps(errors, 'username')}
                        autoFocus />
                </div>
                <div>
                    <PasswordField name="password"
                        label="Password"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        fullWidth
                        {...fieldErrorProps(errors, 'password')} />
                </div>
                <div>
                    <FormControlLabel label="Remember me on this device" control={<Checkbox name="remember" onChange={handleChange} />} />
                </div>
                <Button type="submit" disabled={isLoading} variant="contained">Sign In</Button>
            </Box>
        </form>
    );
}