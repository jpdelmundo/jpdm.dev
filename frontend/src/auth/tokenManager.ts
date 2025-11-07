import type { AccessToken } from '@shared/types/AccessToken';
import type { ApiResult } from '@shared/types/ApiResult';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { getFingerprint } from '../utils/device';

export const getNewToken = async (): Promise<AccessToken> => {
    console.log('__getNewToken__ called');
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const fingerprint = jsonBase64Encode(getFingerprint());

    const res = await fetch(`${baseUrl}/auth/refresh-token`, {
        method: 'post',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fingerprint })
    });

    if (res.ok) {
        const resData = await res.json() as ApiResult<AccessToken>;
        return resData?.data ?? null;
    }

    return null;
}