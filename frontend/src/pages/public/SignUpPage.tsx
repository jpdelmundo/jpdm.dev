import { apiPost } from '@/api/apiClient';
import { SignUpForm, type FormInput, type FormSubmitResult as SignUpFormSubmitResult } from '@/components/SignUpForm';
import { UpdateEmailForm } from '@/components/UpdateEmailForm';
import { useAuthStore } from '@/store/useAuthStore';
import { getFingerprint } from '@/utils/device';
import { getErrorMessage } from '@/utils/helper.ts';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ApiResult } from '@shared/types/ApiResult';
import type { EmailFormInput } from '@shared/types/EmailFormInput';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useState } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { Link, useNavigate } from 'react-router-dom';

function SignUpContent() {
    const [step, setStep] = useState<'create_user' | 'user_created' | 'add_email' | 'signed_up'>('create_user');
    const { executeRecaptcha } = useGoogleReCaptcha();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [email, setEmail] = useState('');

    const submit = async (formInput: FormInput): Promise<ApiResult<SignUpFormSubmitResult>> => {
        //console.log({ formInput });

        if (!executeRecaptcha) {
            //console.log('Execute recaptcha not yet available');
            return { ok: false, error: { message: 'Execute recaptcha not yet available' } };
        }

        const token = await executeRecaptcha('sign_up');
        const res = await apiPost<SignUpFormSubmitResult>('/users', { ...formInput, fp: jsonBase64Encode(getFingerprint()), token });
        return res; //return to show error message on form
    };

    const signUpSuccess = (result: ApiResult<SignUpFormSubmitResult>) => {
        if (!result.data?.access_token) {
            //redirect to signin
            navigate('/signin', { replace: true });
        } else {
            //set access token and show email update form
            useAuthStore.getState().setToken(result.data.access_token);
            setStep('user_created');
        }
    };

    const emailSubmit = async (formInput: EmailFormInput): Promise<ApiResult<never>> => {
        const res = await apiPost<never>('/users/email-code', formInput);
        return res; //return to show error message on form
    }

    const codeSubmit = async (formInput: EmailFormInput): Promise<ApiResult<{ email: string }>> => {
        const res = await apiPost<{ email: string }>('/users/email-code-confirm', formInput);
        return res; //return to show error message on form
    }

    const emailConfirmed = async (result: ApiResult<{ email: string }>) => {
        if (result.ok && result.data?.email) {
            setEmail(result.data.email);
            setStep('signed_up');
        } else {
            setErrorMessage(getErrorMessage(result));
        }
        //redirect or add link to home?
    }

    const secureOnClick = () => {
        setStep('add_email');
    }

    return <Paper sx={{ p: 6, maxWidth: 400, mx: 'auto' }}>
        {step == 'create_user' && <SignUpForm onSubmit={submit} onSignUpSuccess={signUpSuccess} />}

        {step == 'user_created' && <>
            <Typography variant="h5" fontWeight="bold" mb={1}>✅ Account created!</Typography>
            <Typography variant="h6" fontWeight="bold" mb={1}>Secure your account by adding an email address?</Typography>
            <Stack mt={2} gap={2}>
                <Button variant="contained" onClick={secureOnClick}>Yes, I want to secure my account.</Button>
                <Link to="/" style={{ alignSelf: 'center' }}>I'll do this later.</Link>
            </Stack>
        </>}

        {step == 'add_email' && <>
            <UpdateEmailForm onEmailSubmit={emailSubmit} onCodeSubmit={codeSubmit} onEmailConfirmed={emailConfirmed} />
        </>}

        {step == 'signed_up' && <Stack>
            <Typography variant="h5" fontWeight="bold" mb={1}>Email added to account</Typography>
            <Typography mb={1}>Successfully added the email to your account:</Typography>
            <Typography mb={1} textAlign={'center'} fontWeight="bold">{email}</Typography>
            <Typography mb={2}>Account secured.👌</Typography>
            <Box textAlign="center" mt={2}><Link to="/">Done. Return to Home.</Link></Box>
        </Stack>}

        {errorMessage && <Typography color="error" textAlign="center" minHeight="21px">{errorMessage}</Typography>}
    </Paper>
}

export function SignUpPage() {
    return (
        <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            minHeight={'100%'}
            height={'70vh'}
            mt={'60px'}
        >
            <Box>
                <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHAV3_SITE_KEY}>
                    <SignUpContent />
                </GoogleReCaptchaProvider>
            </Box>
        </Box>
    );
}