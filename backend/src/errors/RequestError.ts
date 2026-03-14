import type { ErrorCode } from "@shared/types/ErrorCode.js";

export class RequestError extends Error {
    public status: number;
    public code?: ErrorCode;
    public data?: unknown;

    constructor(message: string, status: number = 400, code?: ErrorCode, data?: unknown) {
        super(message);
        this.status = status;
        code && (this.code = code);
        data && (this.data = data);
        this.name = 'RequestError';

        Object.setPrototypeOf(this, RequestError.prototype);
    }
}