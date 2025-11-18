export const ApiErrorCode = {
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_MISSING: 'TOKEN_MISSING',
    TOKEN_INVALID: 'TOKEN_INVALID',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    NETWORK_ERROR: 'NETWORK_ERROR',
    AUTH_HEADER_MISSING: 'AUTH_HEADER_MISSING',
    AUTH_HEADER_INVALID: 'AUTH_HEADER_INVALID',
    SERVER_ERROR: 'SERVER_ERROR',
    USERNAME_ALREADY_USED: 'USERNAME_ALREADY_USED',
    EMAIL_ALREADY_USED: 'EMAIL_ALREADY_USED',
    BOT_DETECTED: 'BOT_DETECTED'
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export interface ApiErrorDetail {
    message: string;
    code?: ApiErrorCode;
    data?: Record<string, unknown>
}

// export type OkResult<T> = { ok: true; data?: T; message?: string; };
// export type FailResult = { ok: false; error?: ApiErrorDetail; };

export type ApiResult<T> = {
    ok: boolean;
    data?: T;
    error?: ApiErrorDetail;
    message?: string;
}