import { apiPost } from '@/api/apiClient';
import { ForgotPasswordForm } from '@/components/ForgotPasswordForm';
import { getFingerprint } from '@/utils/device';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import type { ApiResult } from '@shared/types/ApiResult';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

type FormInput = {
    email?: string;
};

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHAV3_SITE_KEY;

//needed because google recaptcha is throwing an error if this is in the same FC
function ForgotPasswordContent({ executeRecaptcha }: { executeRecaptcha?: (action: string) => Promise<string> }) {
    const emailSubmit = async (formInput: FormInput): Promise<ApiResult<never>> => {
        if (executeRecaptcha) {
            const token = await executeRecaptcha('recover_account');
            return await apiPost<never>('/users/recover-account', { ...formInput, token, fp: jsonBase64Encode(getFingerprint()) });
        }

        return await apiPost<never>('/users/recover-account', { ...formInput, fp: jsonBase64Encode(getFingerprint()) });
    }

    return <Paper sx={{ p: 6, maxWidth: 400, mx: 'auto' }}>
        <ForgotPasswordForm onEmailSubmit={emailSubmit} />
    </Paper>;
}

export function ForgotPasswordContentWithCaptcha() {
    const { executeRecaptcha } = useGoogleReCaptcha();
    return <ForgotPasswordContent executeRecaptcha={executeRecaptcha} />;
}

export function ForgotPasswordPage() {
    return (
        <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            minHeight={'100%'}
            height={'70vh'}
            mt={'60px'}
        >
            {RECAPTCHA_SITE_KEY ? (
                <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
                    <ForgotPasswordContentWithCaptcha />
                </GoogleReCaptchaProvider>
            ) : (
                <ForgotPasswordContent />
            )}

        </Box>
    );
}