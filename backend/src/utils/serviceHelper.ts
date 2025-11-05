// import type { ErrorCode, ErrorDetail, ServiceResult } from '../types/ServiceResult';

// export const ok = <T>(data?: T, message?: string): ServiceResult<T> => {
//     const result: ServiceResult<T> = { ok: true };

//     data && (result.data = data);
//     message && (result.message = message);

//     return result as ServiceResult<T>;
// }

// export const fail = <T>(message?: string, code?: ErrorCode, data?: Record<string, unknown>): ServiceResult<T> => {
//     const result: ServiceResult<T> = { ok: false };
//     const error: ErrorDetail = { message: message || 'Service request failed' };
//     code && (error.code = code);
//     data && (error.data = data);
//     result.error = error;

//     return result;
// }