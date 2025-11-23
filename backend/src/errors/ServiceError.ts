import type { ErrorCode } from '@shared/types/ErrorCode';

export class ServiceError extends Error {
    public code?: ErrorCode;
    public data?: unknown;

    constructor(message: string, code?: ErrorCode, data?: unknown) {
        super(message);
        code && (this.code = code);
        data && (this.data = data);
        this.name = 'ServiceError';

        Object.setPrototypeOf(this, ServiceError.prototype);
    }
}