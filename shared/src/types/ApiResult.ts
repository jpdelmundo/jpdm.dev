import { ErrorCode } from './ErrorCode';
import type { NotPromise } from './NotPromise';

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