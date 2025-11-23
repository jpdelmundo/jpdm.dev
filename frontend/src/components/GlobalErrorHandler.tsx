import { useAuthStore } from '@/store/useAuthStore';
import { ErrorCode } from '@shared/types/ErrorCode';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientApiError } from '../api/apiClient';

export function GlobalErrorHandler() {
    const clearToken = useAuthStore(s => s.clearToken);
    const navigate = useNavigate();

    useEffect(() => {
        function handlePromiseRejection(event: PromiseRejectionEvent) {
            const error = event.reason;
            console.error("Uncaught promise rejection:", error);
            if (error instanceof ClientApiError) {
                if (error.code == ErrorCode.TOKEN_EXPIRED) {
                    clearToken();
                    navigate('/signin', { replace: true });
                }
            }
        }

        function handleError(event: ErrorEvent) {
            console.error("Uncaught error:", event.error || event.message);
        }

        window.addEventListener('unhandledrejection', handlePromiseRejection);
        window.addEventListener('error', handleError);
        return () => {
            window.removeEventListener('unhandledrejection', handlePromiseRejection);
            window.removeEventListener('error', handleError);
        }
    }, []);

    return null;
}