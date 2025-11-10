import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function AuthInitializer() {
    const refreshToken = useAuthStore(s => s.refreshToken);
    const ready = useAuthStore(s => s.ready);
    const location = useLocation();

    useEffect(() => {
        const pathsDontRefreshToken = ['/login', '/logout']; //do not refresh token on login and logout page load
        if (!pathsDontRefreshToken.includes(location.pathname) && !ready) refreshToken();
    }, [location]);

    return null;
}