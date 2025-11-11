import { useFormValidation, type ValidationRuleFunction } from '@/hooks/useFormValidation';
import { fieldErrorProps, getErrorMessage } from '@/utils/helper';
import type { AccessToken } from '@shared/types/AccessToken';
import type { ApiResult } from '@shared/types/ApiResult';
import { useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import PasswordField from './PasswordField';
import TextField from './TextField';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';

export type FormInput = { username: string, password: string };

export function LoginForm({ onSubmit, onLoginSuccess }: {
    onSubmit: (formInput: FormInput) => Promise<ApiResult<AccessToken>>,
    onLoginSuccess: (result: ApiResult<AccessToken>) => void
}) {
    console.log('LoginForm rendered at:', new Date().toISOString());
    //const formInputRef = useRef<FormInput>(Object.fromEntries(Object.keys({} as FormInput).map(key => [key, ''])) as FormInput);
    const formInputRef = useRef<FormInput>({ username: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const validationRules: Record<keyof FormInput, ValidationRuleFunction> = {
        username: (value: string) => {
            if (!value.trim()) return 'Username required';
            return '';
        },
        password: (value: string) => {
            if (!value.trim()) return 'Password required';
            return '';
        }
    };

    const { errors, validateField, validateForm } = useFormValidation(validationRules);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, type, checked, value } = e.target;
        formInputRef.current = {
            ...formInputRef.current,
            [name]: type == 'checkbox' ? checked : value
        };
        console.log({ formInputRef, target: e.target });
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        if (!isSubmitted) return;
        const { name, value } = e.target;
        validateField(name as keyof FormInput, value);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        if (!validateForm(formInputRef.current) || isLoading) return;
        console.log("Form submitted with data:", formInputRef.current);

        setErrorMessage('');
        setIsLoading(true);

        const result = await onSubmit(formInputRef.current);
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
                <Typography color="error" textAlign="center" minHeight="21px">{errorMessage}</Typography>
            </Box>
        </form>
    );
}