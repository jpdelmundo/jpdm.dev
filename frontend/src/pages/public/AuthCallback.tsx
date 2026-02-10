import { useAuthStore } from '@/store/useAuthStore';
import { useLocation, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useEffect } from 'react';

export const AuthCallbackPage = () => {
    const setToken = useAuthStore(s => s.setToken);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        console.log({ ref: document.referrer });
        const token = new URLSearchParams(location.search).get('token');

        if (!token) {
            navigate('/signin', {
                replace: true,
                state: { error: 'We\'re having trouble signing you in. Please try again.', detail: 'No authentication token received' }
            })
            return;
        }

        const from = location.state?.from?.pathname || '/';
        setToken(token);
        console.log({ state: location.state });
        //remove token from history
        navigate(from, { replace: true });
    }, [location.search]);

    return (
        <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            minHeight={'100%'}
            height={'70vh'}
            mt={'60px'}
        >
            <Paper elevation={0} sx={{ p: 6, maxWidth: 400, mx: 'auto' }}>
                Finalizing authentication...
            </Paper>
        </Box>
    );
}