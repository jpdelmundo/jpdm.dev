import { apiPost } from '@/api/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { getFingerprint } from '@/utils/device';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useNavigate } from 'react-router-dom';

export function Logout() {
    const navigate = useNavigate();
    const clearToken = useAuthStore(s => s.clearToken);

    const logout = async () => {
        await apiPost('/auth/logout', { fingerprint: jsonBase64Encode(getFingerprint()) });
        clearToken();
        navigate('/login');
    }
    logout();

    // useEffect(() => {

    // }, []);

    return null;
}