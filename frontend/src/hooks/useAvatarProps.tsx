import { useAuthStore } from "@/store/useAuthStore";
import { useUserProfileStore } from "@/store/useUserProfileStore";

export type AvatarProps = {
    display_name: string;
    avatar_url: string;
}

export const useAvatarProps = (): AvatarProps | null => {
    const ready = useAuthStore(s => s.ready);
    const user = useAuthStore(s => s.user);
    const userProfile = useUserProfileStore(s => s.userProfile);

    if (!ready) return null;

    return {
        display_name: user?.username || userProfile?.first_name || '',
        avatar_url: userProfile?.avatar_url || '',
    };
};