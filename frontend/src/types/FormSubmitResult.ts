import type { ErrorCode } from '@shared/types/ErrorCode';

export type FormSubmitResult = { success: boolean; message?: string; code?: ErrorCode }