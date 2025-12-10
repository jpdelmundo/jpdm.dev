import { apiPost } from '@/api/apiClient';
import { SignInForm, type FormInput } from "@/components/SignInForm";
import { useAuthStore } from '@/store/useAuthStore';
import { getFingerprint } from '@/utils/device';
import type { AccessToken } from '@shared/types/AccessToken';
import type { ApiResult } from '@shared/types/ApiResult';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useLocation, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

export const SignInPage = () => {
    const setToken = useAuthStore(s => s.setToken);
    // const isAuthenticated = useAuthStore(s => s.isAuthenticated);
    const location = useLocation();
    const navigate = useNavigate();

    //const from = location.state?.from?.pathname || '/';
    // if (isAuthenticated) {
    //     return <Navigate to={from} replace />;
    // }

    const submit = async (formInput: FormInput): Promise<ApiResult<AccessToken>> => {
        const res = await apiPost<AccessToken>('/auth/signin', { ...formInput, fp: jsonBase64Encode(getFingerprint()) });
        return res;
    };

    const signInSuccess = (result: ApiResult<AccessToken>) => {
        if (!result.data) throw new Error('Something went wrong. Sign-in was successful but returned an empty token.');
        const from = location.state?.from?.pathname || '/';

        setToken(result.data);
        navigate(from, { replace: true });
    };

    return (
        <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            minHeight={'100%'}
        >
            <Paper elevation={0} sx={{ p: 6, maxWidth: 400, mx: 'auto', mt: '-60px' }}>
                <SignInForm onSubmit={submit} onSignInSuccess={signInSuccess} />
            </Paper>
        </Box>
    );
}