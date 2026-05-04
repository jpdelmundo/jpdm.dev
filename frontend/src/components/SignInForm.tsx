import facebookButtonImage from '@/assets/images/signin-facebook.svg';
import googleButtonImage from '@/assets/images/signin-google.svg';
import { useFormValidation, type ValidationRuleFunction } from '@/hooks/useFormValidation';
import { getFingerprint } from '@/utils/device';
import { fieldErrorProps, getErrorMessage } from '@/utils/helper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { AccessToken } from '@shared/types/AccessToken';
import type { ApiResult } from '@shared/types/ApiResult';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { Link as RouterLink } from 'react-router-dom';
import PasswordField from './PasswordField';
import TextField from './TextField';

export type FormInput = {
    username: string;
    password: string;
    remember: boolean;
};

export function SignInForm({ onSubmit, onSignInSuccess: onSignInSuccess }: {
    onSubmit: (formInput: FormInput) => Promise<ApiResult<AccessToken>>,
    onSignInSuccess: (result: ApiResult<AccessToken>) => void
}) {
    //const formInputRef = useRef<FormInput>(Object.fromEntries(Object.keys({} as FormInput).map(key => [key, ''])) as FormInput);
    const formInputRef = useRef<FormInput>({ username: '', password: '', remember: true });
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const validationRules: Record<keyof Omit<FormInput, 'remember'>, ValidationRuleFunction> = {
        username: (value: unknown) => {
            if (!String(value).trim()) return 'Username required';
            return '';
        },
        password: (value: unknown) => {
            if (!String(value).trim()) return 'Password required';
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
        //console.log({ formInputRef, target: e.target });
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
        //console.log("Form submitted with data:", formInputRef.current);

        setErrorMessage('');
        setIsLoading(true);

        const result = await onSubmit(formInputRef.current);
        setIsLoading(false);

        if (result.ok) {
            onSignInSuccess(result);
        } else {
            setErrorMessage(getErrorMessage(result));
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <Box display="flex" flexDirection="column" gap={1}>
                <Stack gap={2}>
                    <Stack>
                        <Link
                            href={`${import.meta.env.VITE_API_BASE_URL}/auth/google?fp=${encodeURIComponent(jsonBase64Encode(getFingerprint()))}`}>
                            <img src={googleButtonImage} style={{ width: '100%' }} alt="Sign In with Google" />
                        </Link>
                        <Link
                            href={`${import.meta.env.VITE_API_BASE_URL}/auth/facebook?fp=${encodeURIComponent(jsonBase64Encode(getFingerprint()))}`}>
                            <img src={facebookButtonImage} style={{ width: '100%' }} alt="Sign In with Facebook" />
                        </Link>
                    </Stack>
                    <Divider>OR</Divider>
                    <TextField name="username"
                        label="Username"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        fullWidth
                        {...fieldErrorProps(errors, 'username')}
                        autoFocus />
                    <PasswordField name="password"
                        label="Password"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        fullWidth
                        {...fieldErrorProps(errors, 'password')} />
                    <FormControlLabel label="Remember me on this device" control={<Checkbox name="remember" onChange={handleChange} checked />} />
                    <Button type="submit" disabled={isLoading} variant="contained">Sign In</Button>
                    {errorMessage && <Typography color="error" textAlign="center">{errorMessage}</Typography>}
                    <Stack>
                        <Link component={RouterLink} to="/signup" textAlign={'center'} mt={1}>I want to create a new account</Link>
                        <Link component={RouterLink} to="/forgot-password" textAlign={'center'} mt={1}>I forgot my password</Link>
                    </Stack>
                </Stack>
            </Box>
        </form>
    );
}