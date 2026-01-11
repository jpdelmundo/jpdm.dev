import { apiPost } from '@/api/apiClient';
import { getNewToken } from '@/auth/tokenManager';
import { getFingerprint } from '@/utils/device';
import type { AccessToken } from '@shared/types/AccessToken';
import type { PayloadData } from '@shared/types/Jwt';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
    token: AccessToken;
    isAuthenticated: boolean;
    isSigneOut: boolean;
    ready: boolean;
    setToken: (token: AccessToken) => void;
    clearToken: () => void;
    user: PayloadData | null;
    refreshToken: () => Promise<void>;
    signOut: (reason?: string) => void;
    signOutReason: string | null;
}
const SECURE_MODE = import.meta.env.VITE_AUTH_SECURE_MODE === 'true';

const memoryStorage = () => {
    let token: AccessToken = null;
    return {
        getItem: () => token,
        setItem: (_key: string, value: AccessToken) => { token = value; },
        removeItem: () => { token = null; }
    }
};

export const useAuthStore = create<AuthState>()(
    persist((set, get) => ({
        token: null,
        isAuthenticated: false,
        isSigneOut: false,
        ready: false,
        setToken: (token: AccessToken) => {
            if (!token) {
                get().clearToken();
                return;
            }

            try {
                const user = jwtDecode<PayloadData>(token);
                if (!user.id) throw new Error('Missing id in token');
                set({ token, isAuthenticated: true, user, isSigneOut: false });
            } catch (error) {
                get().clearToken();
                console.error('Error in parsing token', error);
            }
        },
        clearToken: () => {
            console.log('clearToken called');
            set({ token: null, isAuthenticated: false, user: null, isSigneOut: true });
        },
        user: null,
        refreshToken: async () => {
            if (!SECURE_MODE || get().isSigneOut) return;
            try {
                const token = await getNewToken();
                if (token && !get().isSigneOut) get().setToken(token);
            } catch (error) {
                console.error('Token refresh failed', error);
                get().clearToken();
            } finally {
                set({ ready: true });
            }
        },
        signOut: async (reason?: string) => {
            reason && set({ signOutReason: reason });
            await apiPost('/auth/signout', { fp: jsonBase64Encode(getFingerprint()) });
            get().clearToken();
        },
        signOutReason: null
    }),
        {
            name: 'auth',
            storage: createJSONStorage(() => SECURE_MODE ? memoryStorage() : localStorage),
            partialize: (state) => ({ token: state.token }),
            // onRehydrateStorage: (state) => {
            //     console.log('onRehydrateStorage called', { state });
            //     if (state?.token) {
            //         console.log('state.token', state.token);
            //         //jwtDecode
            //         try {
            //             const token = state.token;
            //             const user = jwtDecode<TokenUserData>(token);
            //             if (!user.id) throw new Error('Missing id in token');
            //             useAuthStore.setState({ token, isAuthenticated: true, user });
            //             console.log('rehydrated', state);
            //         } catch (error) {
            //             useAuthStore.setState({ token: null, isAuthenticated: false, user: null });
            //             console.error('Error in parsing token', error);
            //         }
            //     }
            // }
        })
);