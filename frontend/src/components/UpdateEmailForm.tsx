import { getErrorMessage, isValidEmail } from '@/utils/helper';
import { ApiErrorCode, type ApiResult } from '@shared/types/ApiResult';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import TextField from './TextField';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export type FormInput = {
    email?: string;
    code?: string;
};

export function UpdateEmailForm({ onEmailSubmit, onCodeSubmit, onEmailConfirmed }: {
    onEmailSubmit: (formInput: FormInput) => Promise<ApiResult<{ code: ApiErrorCode }>>,
    onCodeSubmit: (formInput: FormInput) => Promise<ApiResult<never>>,
    onEmailConfirmed: (result: ApiResult<never>) => void
}) {
    const { register, handleSubmit, setError, formState: { errors } } = useForm<FormInput>();
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'email' | 'code'>('email');
    const inputRef = useRef<HTMLInputElement>(null);

    const submitHandler: SubmitHandler<FormInput> = async (data) => {
        setErrorMessage('');
        setIsLoading(true);
        if (step == 'email') {
            const result = await onEmailSubmit(data);
            if (result.ok) {
                setStep('code');
            } else {
                if (result.error?.code == ApiErrorCode.EMAIL_ALREADY_USED) setError('email', { type: 'manual', message: 'Please use a different email' }, { shouldFocus: true });
                setErrorMessage(getErrorMessage(result));
            }
        } else if (step == 'code') {
            const result = await onCodeSubmit(data);
            if (result.ok) {
                onEmailConfirmed(result);
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
                        <Typography variant="h5" fontWeight="bold" mb={1}>Secure your account?</Typography>
                        <Typography mb={1}>In case you forgot your password, we can send a recovery link to your email address.</Typography>
                        <TextField inputRef={inputRef} key="email" label="Email"
                            {...register('email', {
                                required: 'Please enter your email address',
                                maxLength: { value: 255, message: 'Email length too long' },
                                validate: (value?: string) => isValidEmail(value || '') || 'Please enter a valid email address'
                            })}
                            placeholder=""
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            fullWidth />
                        <Typography>We'll send a code to this email after you click the button below.</Typography>
                        <Button type="submit" variant="contained" disabled={isLoading}>
                            {isLoading ? <Stack direction="row" alignItems="center" gap={1}><CircularProgress /> <span>Processing...</span></Stack> : 'Send code to my email'}
                        </Button>
                    </>
                )}

                {step == 'code' && (
                    <>
                        <Typography variant="h5" fontWeight="bold" mb={1}>Code sent</Typography>
                        <Typography>Please enter the code we sent to your email:</Typography>
                        <TextField inputRef={inputRef} key="code" label=""
                            {...register('code', {
                                required: 'Please enter the code',
                                minLength: { value: 4, message: 'Please enter the code' }
                            })}
                            autoFocus
                            placeholder=""
                            error={!!errors.code}
                            helperText={errors.code?.message}
                            inputTextAlign="center"
                            slotProps={{
                                htmlInput: {
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                    maxLength: 4,
                                    minLength: 4,
                                    sx: {
                                        textAlign: 'center',
                                        width: 120,
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                        height: 40,
                                        letterSpacing: 5
                                    }
                                }
                            }}
                            onInput={(e: ChangeEvent<HTMLInputElement>) => {
                                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                            }}
                            sx={{
                                alignSelf: 'center'
                            }} />
                        <Button type="submit" variant="contained" disabled={isLoading}>
                            {isLoading ? <Stack direction="row" alignItems="center" gap={1}><CircularProgress /> <span>Processing...</span></Stack> : 'Submit code'}
                        </Button>
                    </>
                )}
                <Typography color="error" textAlign="center" minHeight="21px">{errorMessage}</Typography>
            </Stack>
        </form>
    );
}