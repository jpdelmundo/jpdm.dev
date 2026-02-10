import { ErrorCode } from './ErrorCode.js';
import type { NotPromise } from './NotPromise.js';

export interface ApiErrorDetail {
    message: string;
    code?: ErrorCode;
    data?: unknown;
}

// export type OkResult<T> = { ok: true; data?: T; message?: string; };
// export type FailResult = { ok: false; error?: ApiErrorDetail; };

export type ApiResult<T> = {
    ok: boolean;
    data?: NotPromise<T> | null;
    error?: ApiErrorDetail;
    message?: string;
}