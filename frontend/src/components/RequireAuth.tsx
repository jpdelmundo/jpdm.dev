import { useAuthStore } from '@/store/useAuthStore';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function RequireAuth() {
    const location = useLocation();
    const isAuthenticated = useAuthStore(s => s.isAuthenticated);
    const ready = useAuthStore(s => s.ready);
    if (!ready) return null;

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
}