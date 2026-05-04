import { apiPost } from "@/api/apiClient";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { getFingerprint } from "@/utils/device";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import type { ApiResult } from "@shared/types/ApiResult";
import { jsonBase64Encode } from "@shared/utils/encoding";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

type FormInput = {
    email?: string;
};

//needed because google recaptcha is throwing an error if this is in the same FC
function CaptchaUser() {
    const { executeRecaptcha } = useGoogleReCaptcha();

    const emailSubmit = async (formInput: FormInput): Promise<ApiResult<never>> => {
        if (!executeRecaptcha) {
            console.error('Execute recaptcha not yet available');
            return { ok: false, error: { message: 'Execute recaptcha not yet available' } };
        }

        const token = await executeRecaptcha('recover_account');
        const res = await apiPost<never>('/users/recover-account', { ...formInput, token, fp: jsonBase64Encode(getFingerprint()) });
        return res;
    }

    return <Paper sx={{ p: 6, maxWidth: 400, mx: 'auto' }}>
        <ForgotPasswordForm onEmailSubmit={emailSubmit} />
    </Paper>;
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
            <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHAV3_SITE_KEY}>
                <CaptchaUser />
            </GoogleReCaptchaProvider>
        </Box>
    );
}