import { apiPost } from '@/api/apiClient';
import { SignUpForm, type FormInput, type FormSubmitResult as SignUpFormSubmitResult } from '@/components/SignUpForm';
import { UpdateEmailForm, type FormInput as EmailFormInput } from '@/components/UpdateEmailForm';
import { useAuthStore } from '@/store/useAuthStore';
import { getFingerprint } from '@/utils/device';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { ApiResult } from '@shared/types/ApiResult';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useState } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { Link, useNavigate } from 'react-router-dom';

function SignUpContent() {
    const [step, setStep] = useState<'create_user' | 'update_email' | 'signed_up'>('create_user');
    const { executeRecaptcha } = useGoogleReCaptcha();
    const navigate = useNavigate();

    const submit = async (formInput: FormInput): Promise<ApiResult<SignUpFormSubmitResult>> => {
        console.log({ formInput });

        if (!executeRecaptcha) {
            console.log('Execute recaptcha not yet available');
            return { ok: false, error: { message: 'Execute recaptcha not yet available' } };
        }
        const token = await executeRecaptcha('submit_form');
        console.log({ token });

        const res = await apiPost<SignUpFormSubmitResult>('/user/create', { ...formInput, fingerprint: jsonBase64Encode(getFingerprint()), token });
        return res; //return to show error message on form
    };

    const signUpSuccess = (result: ApiResult<SignUpFormSubmitResult>) => {
        if (!result.data?.access_token) {
            //redirect to signin
            navigate('/signin', { replace: true });
        } else {
            //set access token and show email update form
            useAuthStore.getState().setToken(result.data.access_token);
            setStep('update_email');
        }
    };

    const emailSubmit = async (formInput: EmailFormInput): Promise<ApiResult<never>> => {
        const res = await apiPost<never>('/user/email-code', formInput);
        return res; //return to show error message on form
    }

    const codeSubmit = async (formInput: EmailFormInput): Promise<ApiResult<never>> => {
        const res = await apiPost<never>('/user/email-code-confirm', formInput);
        return res; //return to show error message on form
    }

    const emailConfirmed = async (result: ApiResult<never>) => {
        if (result.ok) setStep('signed_up');
        //redirect or add link to home?
    }

    return <Paper elevation={0} sx={{ p: 6, maxWidth: 400, mx: 'auto' }}>
        {step == 'create_user' && <SignUpForm onSubmit={submit} onSignUpSuccess={signUpSuccess} />}

        {step == 'update_email' && <>
            <UpdateEmailForm onEmailSubmit={emailSubmit} onCodeSubmit={codeSubmit} onEmailConfirmed={emailConfirmed} />
            <Box textAlign="center" mt={2}><Link to="/">I'll do this later.</Link></Box>
        </>}

        {step == 'signed_up' && <Typography variant="h5" fontWeight="bold">Signed Up</Typography>}
    </Paper>
}

export function SignUp() {
    return (
        <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            minHeight={'100%'}
        >
            <Box mt={'-60px'}>
                <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHAV3_SITE_KEY}>
                    <SignUpContent />
                </GoogleReCaptchaProvider>
            </Box>
        </Box>
    );
}