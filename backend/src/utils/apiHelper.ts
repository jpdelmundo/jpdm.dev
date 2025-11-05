import type { ApiErrorCode, ApiErrorDetail, ApiResult } from '@shared/types/ApiResult';
import type { Response } from 'express';

export class ApiError extends Error {
    public status: number;
    public code?: ApiErrorCode;

    constructor(message: string, status: number = 400, code?: ApiErrorCode) {
        super(message);
        this.status = status;
        code && (this.code = code);
        this.name = 'ApiError';

        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

const apiResponse = <T>(res: Response, ok: boolean, data?: T | null, error?: ApiErrorDetail | null, message?: string | null, status: number = 400): Response<ApiResult<T>> => {
    const result: ApiResult<T> = { ok };

    result.ok && message && (result.message = message);
    result.ok && data && (result.data = data);
    !result.ok && error && (result.error = error);

    return res.status(status).json(result);
}

export const ok = <T>(res: Response, data?: T | null, message?: string): Response<ApiResult<T>> => {
    return apiResponse(res, true, data, null, message, 200);
}

export const fail = (res: Response, message?: string, status?: number, code?: ApiErrorCode | null, data?: Record<string, unknown>): Response<ApiResult<never>> => {
    const error: ApiErrorDetail = { message: message || 'Something went wrong' };
    code && (error.code = code);
    data && (error.data = data);
    return apiResponse(res, false, null, error, null, status);
}

export const error = (res: Response, message: string, code?: ApiErrorCode, status: number = 500): Response<ApiResult<never>> => {
    const result: ApiResult<never> = { ok: false };
    const error: ApiErrorDetail = { message };
    code && (error.code = code);
    result.error = error;

    return res.status(status).json(result);
}