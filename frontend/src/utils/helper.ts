import type { ApiResult } from '@shared/types/ApiResult';

export const fieldErrorProps = (errors: Record<string, string>, fieldName: string) => {
    return { error: !!errors[fieldName], helperText: errors[fieldName] || ' ' };
}

export const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export const getErrorMessage = (result: ApiResult<unknown>) => {
    return result.error?.message || 'Something went wrong';
}