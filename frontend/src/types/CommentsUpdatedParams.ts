import type { CommentDTO } from "@shared/models/dto/CommentDTO";

export interface CommentsUpdatedParams {
    type: 'comment_added' | 'comment_deleted' | 'comment_updated';
    comment?: CommentDTO;
}