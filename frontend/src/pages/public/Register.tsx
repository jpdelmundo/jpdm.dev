import { apiPost } from '@/api/apiClient';
import { RegisterForm, type FormData, type FormSubmitResult as RegisterFormSubmitResult } from '@/components/RegisterForm';
import { UpdateEmailForm, type FormData as EmailFormData } from '@/components/UpdateEmailForm';
import { useAuthStore } from '@/store/useAuthStore';
import { getFingerprint } from '@/utils/device';
import { Box, Paper, Typography } from '@mui/material';
import type { ApiResult } from '@shared/types/ApiResult';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useState } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { Link, useNavigate } from 'react-router-dom';

function RegisterContent() {
    const [step, setStep] = useState<'create_user' | 'update_email' | 'registered'>('create_user');
    const { executeRecaptcha } = useGoogleReCaptcha();
    const navigate = useNavigate();

    const submit = async (formData: FormData): Promise<ApiResult<RegisterFormSubmitResult>> => {
        console.log({ formData });

        if (!executeRecaptcha) {
            console.log('Execute recaptcha not yet available');
            return { ok: false, error: { message: 'Execute recaptcha not yet available' } };
        }
        const token = await executeRecaptcha('submit_form');
        console.log({ token });

        const res = await apiPost<RegisterFormSubmitResult>('/user/create', { ...formData, fingerprint: jsonBase64Encode(getFingerprint()), token });
        return res; //return to show error message on form
    };

    const registerSuccess = (result: ApiResult<RegisterFormSubmitResult>) => {
        if (!result.data?.access_token) {
            //redirect to login
            navigate('/login', { replace: true });
        } else {
            //set access token and show email update form
            useAuthStore.getState().setToken(result.data.access_token);
            setStep('update_email');
        }
    };

    const emailSubmit = async (formData: EmailFormData): Promise<ApiResult<never>> => {
        const res = await apiPost<never>('/user/email-code', formData);
        return res; //return to show error message on form
    }

    const codeSubmit = async (formData: EmailFormData): Promise<ApiResult<never>> => {
        const res = await apiPost<never>('/user/email-code-confirm', formData);
        return res; //return to show error message on form
    }

    const emailConfirmed = async (result: ApiResult<never>) => {
        if (result.ok) setStep('registered');
        //redirect or add link to home?
    }

    return <Paper elevation={0} sx={{ p: 6, maxWidth: 400, mx: 'auto' }}>
        {step == 'create_user' && <RegisterForm onSubmit={submit} onRegisterSuccess={registerSuccess} />}

        {step == 'update_email' && <>
            <UpdateEmailForm onEmailSubmit={emailSubmit} onCodeSubmit={codeSubmit} onEmailConfirmed={emailConfirmed} />
            <Box textAlign="center" mt={2}><Link to="/">I'll do this later.</Link></Box>
        </>}

        {step == 'registered' && <Typography variant="h5" fontWeight="bold">Registered</Typography>}
    </Paper>
}

export function Register() {
    return (
        <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHAV3_SITE_KEY}>
            <RegisterContent />
        </GoogleReCaptchaProvider>
    );
}