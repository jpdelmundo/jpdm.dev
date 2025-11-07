import { apiPost } from '@/api/apiClient';
import { LoginForm, type FormData } from "@/components/LoginForm";
import { useAuthStore } from '@/store/useAuthStore';
import { getFingerprint } from '@/utils/device';
import { Container, Paper } from '@mui/material';
import type { AccessToken } from '@shared/types/AccessToken';
import type { ApiResult } from '@shared/types/ApiResult';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
    const setToken = useAuthStore(s => s.setToken);
    // const isAuthenticated = useAuthStore(s => s.isAuthenticated);
    // const location = useLocation();
    const navigate = useNavigate();

    //const from = location.state?.from?.pathname || '/';
    // if (isAuthenticated) {
    //     return <Navigate to={from} replace />;
    // }

    const submit = async (formData: FormData): Promise<ApiResult<AccessToken>> => {
        const res = await apiPost<AccessToken>('/auth/login', { ...formData, fingerprint: jsonBase64Encode(getFingerprint()) });
        return res;
    };

    const loginSuccess = (result: ApiResult<AccessToken>) => {
        if (!result.data) throw new Error('Something went wrong. Login was successful but returned an empty token.');

        setToken(result.data);
        navigate('/', { replace: true });
    };

    return (
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', pt: '20vh' }}>
            <Paper elevation={0} sx={{ p: 6, maxWidth: 400, mx: 'auto' }}>
                <LoginForm onSubmit={submit} onLoginSuccess={loginSuccess} />
            </Paper>
        </Container>
    );
}