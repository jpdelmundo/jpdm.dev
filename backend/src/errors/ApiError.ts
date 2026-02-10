import type { ErrorCode } from '@shared/types/ErrorCode.js';

export class ApiError extends Error {
    public status: number;
    public code?: ErrorCode;

    constructor(message: string, status: number = 400, code?: ErrorCode) {
        super(message);
        this.status = status;
        code && (this.code = code);
        this.name = 'ApiError';

        Object.setPrototypeOf(this, ApiError.prototype);
    }
}