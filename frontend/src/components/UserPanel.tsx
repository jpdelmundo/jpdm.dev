import { apiPost } from '@/api/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { getFingerprint } from '@/utils/device';
import { CircularProgress, Grid, Link } from '@mui/material';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export const UserPanel = () => {
    const user = useAuthStore(s => s.user);
    const navigate = useNavigate();
    const clearToken = useAuthStore(s => s.clearToken);
    const isAuthenticated = useAuthStore(s => s.isAuthenticated)
    const [loading, setLoading] = useState(false);

    const logout = async () => {
        setLoading(true);
        await apiPost('/auth/logout', { fingerprint: jsonBase64Encode(getFingerprint()) });
        setLoading(false);
        clearToken();
        navigate('/login');
    }

    return (
        <Grid container gap={1}>
            <Grid><Link component={RouterLink} to="/login">Login</Link> {user?.username}</Grid>
            <Grid>{loading ? <CircularProgress /> : (isAuthenticated && <Link onClick={logout} sx={{ cursor: 'pointer' }}>Logout</Link>)}</Grid>
        </Grid>
    );
}