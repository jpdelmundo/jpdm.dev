import { getErrorMessage } from '@/utils/helper';
import { type ApiResult } from '@shared/types/ApiResult';
import { useEffect, useRef, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import TextField from './TextField';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ErrorCode } from '@shared/types/ErrorCode';
import { isValidEmail } from '@shared/utils/validation';
import { Link as RouterLink } from 'react-router-dom';

export type FormInput = {
    email?: string;
};

export function ForgotPasswordForm({ onEmailSubmit }: {
    onEmailSubmit: (formInput: FormInput) => Promise<ApiResult<{ code: ErrorCode }>>
}) {
    const { register, handleSubmit, setError, formState: { errors } } = useForm<FormInput>();
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'email' | 'sent'>('email');
    const inputRef = useRef<HTMLInputElement>(null);

    const submitHandler: SubmitHandler<FormInput> = async (data) => {
        if (isLoading) return;
        inputRef.current?.blur();
        setErrorMessage('');
        setIsLoading(true);
        if (step == 'email') {
            const result = await onEmailSubmit(data);
            if (result.ok) {
                setStep('sent');
            } else {
                setErrorMessage(getErrorMessage(result));
            }
        }
        setIsLoading(false);
    }

    useEffect(() => {
        inputRef.current?.focus();
    }, [step]);

    return (
        <form noValidate onSubmit={handleSubmit(submitHandler)}>
            <Stack gap={2}>
                {step == 'email' && (
                    <>
                        <Typography variant="h5" fontWeight="bold" mb={1}>Account Recovery</Typography>
                        <Typography>Please enter the email address associated with your account. It was requested during sign-up (or optionally in your settings).</Typography>
                        <Typography>If no email is associated with your account, account recovery will not be possible.</Typography>
                        <TextField inputRef={inputRef} key="email" label="Email"
                            {...register('email', {
                                required: true,
                                validate: (value?: string) => isValidEmail(value || '') || 'Please enter a valid email address'
                            })}
                            placeholder=""
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            fullWidth />
                        <Typography>We'll send recovery instructions to this email if it's linked to your account.</Typography>
                        <Button type="submit" variant="contained" disabled={isLoading}>
                            {isLoading ? <Stack direction="row" alignItems="center" gap={1}><CircularProgress /> <span>Processing...</span></Stack> : 'Submit'}
                        </Button>
                    </>
                )}

                {step == 'sent' && (
                    <>
                        <Typography variant="h5" fontWeight="bold" mb={1}>Recovery instructions sent</Typography>
                        <Typography>If the email address exists and is associated with your account, recovery instructions will be sent to it.</Typography>
                        <Typography>Please check your inbox (or spam folder) and follow the instructions provided.</Typography>
                        <Link component={RouterLink} to="/signin" textAlign={'center'} mt={1}>Return to the sign-in page</Link>
                    </>
                )}
                {errorMessage && <Typography color="error" textAlign="center" minHeight="21px">{errorMessage}</Typography>}
            </Stack>
        </form>
    );
}