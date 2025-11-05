import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';

export function AuthInitializer() {
    const refreshToken = useAuthStore(s => s.refreshToken);

    useEffect(() => {
        refreshToken();
    }, []);

    return null;
}