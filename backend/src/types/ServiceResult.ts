import type { ErrorCode } from '@shared/types/ErrorCode';

export interface ServiceErrorDetail {
    message: string;
    code?: ErrorCode;
    data?: unknown;
}

export type ServiceResult<T> = {
    ok: boolean;
    data?: T;
    error?: ServiceErrorDetail;
    message?: string;
};