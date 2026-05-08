import { getErrorMessage } from '@/utils/helper';
import { type ApiResult } from '@shared/types/ApiResult';
import { useEffect, useRef, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import TextField from './TextField';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { EmailFormInput } from '@shared/types/EmailFormInput';
import { ErrorCode } from '@shared/types/ErrorCode';
import { isValidEmail } from '@shared/utils/validation';
import { CountdownTimer } from './CountdownTimer';

type Props = {
    onEmailSubmit: (formInput: EmailFormInput) => Promise<ApiResult<{ code: ErrorCode }>>,
    onCodeSubmit: (formInput: EmailFormInput) => Promise<ApiResult<{ email: string }>>,
    onEmailConfirmed: (result: ApiResult<{ email: string }>) => void,
    email?: string;
};

export function UpdateEmailForm({ onEmailSubmit, onCodeSubmit, onEmailConfirmed, email }: Props) {
    //console.log('UpdateEmailForm render');
    const { register, handleSubmit, setError, formState: { errors } } = useForm<EmailFormInput>({
        defaultValues: {
            email: email || ''
        }
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'email' | 'code'>('email');
    const inputRef = useRef<HTMLInputElement>(null);
    const [cooldown, setCooldown] = useState<number | null>(null);

    const submitHandler: SubmitHandler<EmailFormInput> = async (data) => {
        if (isLoading) return;
        inputRef.current?.blur();
        setErrorMessage('');
        setIsLoading(true);
        if (step == 'email') {
            const result = await onEmailSubmit(data);
            if (result.ok) {
                setStep('code');
            } else {
                if (result.error?.code == ErrorCode.COOLDOWN) {
                    const errorData = result.error?.data as { cooldown: number };
                    setCooldown(errorData.cooldown);
                } else if (result.error?.code == ErrorCode.ALREADY_USED) {
                    setError('email', { type: 'manual', message: 'Please use a different email' }, { shouldFocus: true });
                    setErrorMessage(getErrorMessage(result));
                } else {
                    setErrorMessage(getErrorMessage(result));
                }
            }
        } else if (step == 'code') {
            const result = await onCodeSubmit(data);
            //console.log({ error: result.error, code: result.error?.code });
            if (result.ok) {
                onEmailConfirmed(result);
            } else {
                setErrorMessage(getErrorMessage(result));
            }
        }
        setIsLoading(false);
    }

    const cooldownOnComplete = () => {
        setCooldown(null);
        //console.log('setCooldown called');
    }

    useEffect(() => {
        inputRef.current?.focus();
    }, [step, email]);

    return (
        <form noValidate onSubmit={handleSubmit(submitHandler)}>
            <Stack gap={2}>
                {step == 'email' && (
                    <>
                        {/* <Typography variant="h5" fontWeight="bold" mb={1}>Secure your account?</Typography>
                        <Typography mb={1}>In case you forgot your password, we can send a recovery link to your email address.</Typography> */}
                        <TextField inputRef={inputRef} key="email" label="Email"
                            {...register('email', {
                                required: 'Please enter your email address',
                                maxLength: { value: 255, message: 'Email length too long' },
                                validate: (value?: string) => isValidEmail(value || '') || 'Please enter a valid email address'
                            })}
                            placeholder="Enter your email address"
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
                        <Typography fontWeight="bold" mb={1}>Code sent</Typography>
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
                            type="number"
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
                            sx={{
                                alignSelf: 'center'
                            }} />
                        <Button type="submit" variant="contained" disabled={isLoading}>
                            {isLoading ? <Stack direction="row" alignItems="center" gap={1}><CircularProgress /> <span>Processing...</span></Stack> : 'Submit code'}
                        </Button>
                    </>
                )}
                {cooldown && <Typography color="error" textAlign="center" minHeight="21px">Please wait <CountdownTimer endTimeMs={cooldown} onComplete={cooldownOnComplete} /> before sending a new code</Typography>}
                {errorMessage && <Typography color="error" textAlign="center" minHeight="21px">{errorMessage}</Typography>}
            </Stack>
        </form>
    );
}