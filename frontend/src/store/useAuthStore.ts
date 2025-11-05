import { getNewToken } from '@/auth/tokenManager';
import type { AccessToken } from '@shared/types/AccessToken';
import type { TokenUserData } from '@shared/types/Jwt';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
    token: AccessToken;
    isAuthenticated: boolean;
    setToken: (token: AccessToken) => void;
    clearToken: () => void;
    user: TokenUserData | null;
    refreshToken: () => Promise<void>;
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
        setToken: (token: AccessToken) => {
            if (!token) {
                get().clearToken();
                return;
            }

            try {
                const user = jwtDecode<TokenUserData>(token);
                if (!user.id) throw new Error('Missing id in token');
                set({ token, isAuthenticated: true, user });
            } catch (error) {
                get().clearToken();
                console.error('Error in parsing token', error);
            }
        },
        clearToken: () => {
            set({ token: null, isAuthenticated: false, user: null });
        },
        user: null,
        refreshToken: async () => {
            if (!SECURE_MODE) return;
            try {
                const token = await getNewToken();
                get().setToken(token);
            } catch (error) {
                console.error('Token refresh failed', error);
                get().clearToken();
            }
        }
    }),
        {
            name: 'auth',
            storage: createJSONStorage(() => SECURE_MODE ? memoryStorage() : localStorage),
            partialize: (state) => ({ token: state.token }),
            onRehydrateStorage: (state) => {
                if (state?.token) {
                    //jwtDecode
                    try {
                        const token = state.token;
                        const user = jwtDecode<TokenUserData>(token);
                        if (!user.id) throw new Error('Missing id in token');
                        useAuthStore.setState({ token, isAuthenticated: true, user });
                    } catch (error) {
                        useAuthStore.setState({ token: null, isAuthenticated: false, user: null });
                        console.error('Error in parsing token', error);
                    }
                }
            }
        })
);