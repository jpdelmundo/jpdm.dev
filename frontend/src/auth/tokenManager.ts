import { VITE_API_BASE_PATH } from '@/config';
import type { AccessToken } from '@shared/types/AccessToken';
import type { ApiResult } from '@shared/types/ApiResult';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { getFingerprint } from '../utils/device';

let refreshPromise: Promise<AccessToken | null> | null = null;

export const getNewToken = async (): Promise<AccessToken> => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const basePath = VITE_API_BASE_PATH;
            const fp = jsonBase64Encode(getFingerprint());

            const res = await fetch(`${basePath}/auth/refresh-token`, {
                method: 'post',
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ fp })
            });

            if (res.ok) {
                const resData = await res.json() as ApiResult<AccessToken>;
                return resData?.data ?? null;
            }

            return null;
        } catch (err) {
            console.error('TOKEN_REFRESH_ERROR', err);
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export const waitForRefreshIfNeeded = async () => {
    if (refreshPromise) {
        await refreshPromise;
    }
};