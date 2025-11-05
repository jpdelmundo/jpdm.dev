import { useAuthStore } from '@/store/useAuthStore';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function RequireAuth() {
    const location = useLocation();
    const isAuthenticated = useAuthStore(s => s.isAuthenticated);
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
}