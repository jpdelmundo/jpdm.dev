import type { ApiErrorCode } from '@shared/types/ApiResult';

export type FormSubmitResult = { success: boolean; message?: string; code?: ApiErrorCode }