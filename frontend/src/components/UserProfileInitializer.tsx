import { useAuthStore } from '@/store/useAuthStore';
import { useUserProfileStore } from '@/store/useUserProfileStore';
import { useEffect } from 'react';

export function UserProfileInitializer() {
    const ready = useAuthStore(s => s.ready);
    const user = useAuthStore(s => s.user);
    const fetchProfile = useUserProfileStore(s => s.fetchProfile);

    useEffect(() => {
        if (ready && user?.id) {
            fetchProfile(user.id);
        }
    }, [ready, user?.id]);

    return null;
}