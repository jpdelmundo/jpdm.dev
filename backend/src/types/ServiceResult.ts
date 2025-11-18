import type { ErrorCode } from 'src/errors/ErrorCode';

export interface ErrorDetail {
    message: string;
    code?: ErrorCode;
    data?: Record<string, unknown>
}

export type ServiceResult<T> = {
    ok: boolean;
    data?: T;
    error?: ErrorDetail;
    message?: string;
};