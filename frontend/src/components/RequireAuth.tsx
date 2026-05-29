import { useAuthStore } from '@/store/useAuthStore';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function RequireAuth() {
    const location = useLocation();
    const isAuthenticated = useAuthStore(s => s.isAuthenticated);
    const mustChangePassword = useAuthStore(s => s.mustChangePassword);
    const ready = useAuthStore(s => s.ready);
    if (!ready) return null;
    if (mustChangePassword && !location.pathname.includes('change-password')) {
        return <Navigate to="/user/change-password" replace />;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/signin" state={{ from: location }} replace />;
}