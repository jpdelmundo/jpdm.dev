import { apiPost } from '@/api/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { getFingerprint } from '@/utils/device';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useNavigate } from 'react-router-dom';

export function SignOut() {
    const navigate = useNavigate();
    const clearToken = useAuthStore(s => s.clearToken);

    const signOut = async () => {
        await apiPost('/auth/signout', { fingerprint: jsonBase64Encode(getFingerprint()) });
        clearToken();
        navigate('/signin');
    }
    signOut();

    // useEffect(() => {

    // }, []);

    return null;
}