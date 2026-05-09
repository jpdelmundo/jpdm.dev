import { getErrorMessage } from '@/utils/helper';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { UserId } from '@shared/models/generated/User';
import type { AccessToken } from '@shared/types/AccessToken';
import { type ApiResult } from '@shared/types/ApiResult';
import { ErrorCode } from '@shared/types/ErrorCode';
import { validatePassword as _validatePassword, validateUsername } from '@shared/utils/validation';
import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';
import PasswordField from './PasswordField';
import TextField from './TextField';

export type FormSubmitResult = { access_token: AccessToken, user_id: UserId }

export type FormInput = {
    username: string;
    password: string;
    confirm_password: string;
    email?: string;
};

export function SignUpForm({ onSubmit, onSignUpSuccess }: {
    onSubmit: (formInput: FormInput) => Promise<ApiResult<FormSubmitResult>>,
    onSignUpSuccess: (result: ApiResult<FormSubmitResult>) => void
}) {
    const { register, handleSubmit, setError, formState: { errors }, watch } = useForm<FormInput>();
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const password = watch('password', '');

    useEffect(() => {
        if (!password) setPasswordErrors([]);
    }, [password]);

    const validatePassword = (value: string) => {
        const errors = _validatePassword(value);
        setPasswordErrors(errors);
        return errors.length == 0 || 'Password does not meet requirements';
    }

    const submitHandler: SubmitHandler<FormInput> = async (data) => {
        setErrorMessage('');
        setIsSubmitting(true);
        const result = await onSubmit(data);
        if (result.ok) {
            onSignUpSuccess(result);
        } else {
            if (result.error?.code == ErrorCode.ALREADY_USED) {
                setError('username', { type: 'manual', message: 'Please choose a different username' }, { shouldFocus: true });
            }
            setErrorMessage(getErrorMessage(result));
        }
        setIsSubmitting(false);
    }

    //console.log({ passwordErrors });

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Create an account</Typography>
            <form noValidate onSubmit={handleSubmit(submitHandler)}>
                <Stack gap={2}>
                    <TextField label="Username"
                        {...register('username', {
                            required: 'Username is required',
                            validate: (value) => {
                                const errors = validateUsername(value);
                                return errors.length == 0 || errors[0];
                            }
                        })}
                        placeholder=""
                        error={!!errors.username}
                        helperText={errors.username?.message}
                        fullWidth
                        autoFocus />
                    <PasswordField label="Password"
                        {...register('password', {
                            required: 'Password is required',
                            validate: validatePassword
                        })}
                        placeholder=""
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        fullWidth />
                    <TransitionGroup style={{ display: passwordErrors.length > 0 ? 'block' : 'none' }}>
                        {passwordErrors.map(error => (
                            <Collapse key={error} timeout={300}>
                                <Stack direction="row" color="error.main" alignItems="center" margin={'0 10px'}>
                                    <CloseIcon fontSize="small" /> <span>{error}</span>
                                </Stack>
                            </Collapse>
                        ))}
                    </TransitionGroup>
                    <PasswordField label="Confirm Password"
                        {...register('confirm_password', {
                            required: 'Please confirm password',
                            validate: (value: string) => password == value || 'Passwords don\'t match'
                        })}
                        error={!!errors.confirm_password}
                        helperText={errors.confirm_password?.message}
                        fullWidth />
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <Stack direction="row" alignItems="center" gap={1}><CircularProgress sx={{ color: '#ffffff' }} /> <span>Processing...</span></Stack> : 'Submit'}
                    </Button>
                    {errorMessage && <Typography color="error" textAlign="center">{errorMessage}</Typography>}
                    <Link component={RouterLink} to="/signin" textAlign={'center'} mt={1}>I want to sign in. I already have an account</Link>
                </Stack>
            </form>
        </Box>

    );
}