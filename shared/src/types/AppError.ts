export interface AppError {
    message: string;
    code?: string;
    data?: Record<string, unknown>
}