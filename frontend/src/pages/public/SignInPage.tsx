import { apiPost } from '@/api/apiClient';
import { SignInForm, type FormInput } from "@/components/SignInForm";
import { useAuthStore } from '@/store/useAuthStore';
import { getFingerprint } from '@/utils/device';
import type { AccessToken } from '@shared/types/AccessToken';
import type { ApiResult } from '@shared/types/ApiResult';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useLocation, useNavigate } from 'react-router-dom';

import { theme } from '@/themes/theme';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';

export const SignInPage = () => {
    const setToken = useAuthStore(s => s.setToken);
    const signOutReason = useAuthStore.getState().signOutReason;
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
    console.log({ signOutReason });
    const message = signOutReason == 'password_changed' ? 'Successfully changed password. You have been signed-out on all your devices. Sign in with your new password.' : '';

    useEffect(() => {
        useAuthStore.setState({ signOutReason: null });
    }, []);

    return (<Container component={'main'} maxWidth="sm" sx={{ pt: '60px' }}>
        <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            minHeight={'100%'}
            height={'70vh'}
            mt={'60px'}
        >
            <Paper elevation={0} sx={{ p: 6, maxWidth: 400, mx: 'auto' }}>
                {message && <Alert severity="info" sx={{ mb: 1, fontSize: theme.typography.body1 }}>{message}</Alert>}
                {location.state?.error && <Typography mb={1} color="error" textAlign="center">{location.state?.error}</Typography>}
                <SignInForm onSubmit={submit} onSignInSuccess={signInSuccess} />
            </Paper>
        </Box>
    </Container>);
}