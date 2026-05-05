export const CommentStatus = {
    AI_APPROVED: 'ai_approved',
    AI_REJECTED: 'ai_rejected',
    USER_APPROVED: 'user_approved',
    USER_REJECTED: 'user_rejected',
} as const;

export type CommentStatus = (typeof CommentStatus)[keyof typeof CommentStatus];
