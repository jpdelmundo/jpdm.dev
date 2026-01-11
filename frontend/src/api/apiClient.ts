import { getNewToken, waitForRefreshIfNeeded } from '@/auth/tokenManager';
import { useAuthStore } from '@/store/useAuthStore';
import type { ApiErrorDetail, ApiResult } from '@shared/types/ApiResult';
import { ErrorCode } from '@shared/types/ErrorCode';

export class ClientApiError extends Error {
    public status: number;
    public code?: ErrorCode;

    constructor(res: Response, detail: ApiErrorDetail) {
        super(detail.message);
        this.status = res.status;
        this.code = detail.code;
        this.name = 'ClientApiError';

        Object.setPrototypeOf(this, ClientApiError.prototype);
    }
}

type ClientApiResult<T> = ApiResult<T> & { status: number };
type JsonPrimitive = string | number | boolean | null;
type JsonArray = JsonValue[];
interface JsonObject { [key: string]: JsonValue; }
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type ApiRequestBody = JsonObject | FormData;
type ApiGetParams = Record<string, string | number | boolean> | URLSearchParams;

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest<T>(input: RequestInfo | URL, init?: RequestInit, isRetry = false) {
    await waitForRefreshIfNeeded();

    try {
        const token = useAuthStore.getState().token;
        const setToken = useAuthStore.getState().setToken;
        const res = await fetch(input, {
            ...init,
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...(init?.headers ?? {}),
            }
        });

        if (!res.ok) {
            const { error } = { ...(await res.json()) };
            if (error.code == ErrorCode.TOKEN_EXPIRED && !isRetry) {
                try {
                    const newToken = await getNewToken();
                    if (newToken) {
                        setToken(newToken);
                        return apiRequest<T>(input, init, true);
                    } else {
                        //fail di makakuha ng new token
                        setToken(null);
                        throw new ClientApiError(res, error);
                    }
                } catch (refreshError) {
                    //kung may error during clear access token din
                    console.error('API_ERROR', { refreshError });
                    setToken(null);
                    throw new ClientApiError(res, error);
                }
            } else {
                //throw new ClientApiError(res, error);
                //changed from throwing an error to returning as a an api "fail" result (with possible return data. ex. email update code request cooldown)
                //throwing error is reserved for real errors
                error.code == ErrorCode.BOT_DETECTED && (error.message = 'Unusual activity detected. Please try again.');
                return { error, ok: res.ok, status: res.status } as ClientApiResult<T>;
            }
        }

        return { ...(await res.json() as ApiResult<T>), ok: res.ok, status: res.status } as ClientApiResult<T>;
    } catch (error) {
        console.log('API Error', error);
        if (error instanceof ClientApiError) throw error;
        if (error instanceof TypeError) throw new Error('Unable to connect to the server. Please check your internet connection.');

        throw new Error('Failed to process server response');
    }
}

export async function apiGet<T>(url: string, params?: ApiGetParams) {
    let getParams = new URLSearchParams();
    if (params) {
        if (params instanceof URLSearchParams) {
            getParams = params;
        } else {
            Object.entries(params).forEach(([k, v]) => {
                getParams.append(k, v.toString());
            });
        }
    }

    let requestUrl = `${baseUrl}${url}`;
    requestUrl = getParams.size > 0 ? `${requestUrl}?${getParams.toString()}` : requestUrl;
    const init = { method: 'get', credentials: 'include' as RequestCredentials };

    return apiRequest<T>(requestUrl, init);
}

export async function apiPost<T>(url: string, body?: ApiRequestBody, onProgress?: (progress: number) => void, isRetry = false) {
    const isFormData = body instanceof FormData;
    const requestUrl = `${baseUrl}${url}`;

    if (isFormData) {
        await waitForRefreshIfNeeded();

        //when uploading a file this is used
        return new Promise<ApiResult<T>>((resolve, reject) => {
            const token = useAuthStore.getState().token;
            const setToken = useAuthStore.getState().setToken;
            const xhr = new XMLHttpRequest();
            xhr.open('post', requestUrl);
            token && xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.onload = async () => {
                try {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const result = JSON.parse(xhr.responseText);
                        resolve({ ...result, ok: true, status: xhr.status } as ClientApiResult<T>);
                        return;
                    }

                    //handle non-2xx response
                    const { error } = { ...(JSON.parse(xhr.responseText)) };
                    if (error.code == ErrorCode.TOKEN_EXPIRED && !isRetry) {
                        try {
                            const newToken = await getNewToken();
                            if (newToken) {
                                setToken(newToken);
                                const result = apiPost<T>(url, body, onProgress, true);
                                resolve(result);
                            } else {
                                //fail di makakuha ng new token
                                setToken(null);
                                reject(new ClientApiError({ status: xhr.status } as Response, error));
                            }
                        } catch (refreshError) {
                            reject(refreshError);
                        }
                    } else {
                        //isRetry = true, ayaw talaga
                        //reject(new ClientApiError({ status: xhr.status } as Response, error));
                        //changed from throwing an error to returning as a an api "fail" result (with possible return data. ex. email update code request cooldown)
                        //throwing error is reserved for real errors
                        resolve({ error, ok: false, status: xhr.status } as ClientApiResult<T>);
                    }
                } catch (error) {
                    console.error('API_ERROR', 'Request error:', error);
                    reject(new Error('Failed to process server response'));
                }
            };

            xhr.onerror = () => reject(new Error('Unable to connect to the server. Please check your internet connection.'));

            if (xhr.upload && onProgress) {
                xhr.upload.onprogress = (ev) => {
                    if (ev.lengthComputable) {
                        const progress = Math.round((ev.loaded / ev.total) * 100);
                        onProgress(progress);
                    }
                }
            }

            xhr.send(body);
        });
    } else {
        const init = {
            method: 'post',
            credentials: 'include' as RequestCredentials,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body)
        };

        return apiRequest<T>(requestUrl, init);
    }
}

export async function apiPut<T>(url: string, body?: ApiRequestBody) {
    const requestUrl = `${baseUrl}${url}`;
    const init = {
        method: 'put',
        credentials: 'include' as RequestCredentials,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
    };

    return apiRequest<T>(requestUrl, init);
}

export async function apiDelete<T>(url: string, body?: ApiRequestBody) {
    const requestUrl = `${baseUrl}${url}`;
    const init = {
        method: 'delete',
        credentials: 'include' as RequestCredentials,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
    };

    return apiRequest<T>(requestUrl, init);
}