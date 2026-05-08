import { apiPost } from '@/api/apiClient';
import { resetAllStores } from '@/store/resetStores';
import { getFingerprint } from '@/utils/device';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useNavigate } from 'react-router-dom';

export function SignOutPage() {
    const navigate = useNavigate();

    const signOut = async () => {
        await apiPost('/auth/signout', { fp: jsonBase64Encode(getFingerprint()) });
        resetAllStores();
        navigate('/signin');
    }
    signOut();

    // useEffect(() => {

    // }, []);

    return null;
}