import type { PostCommentDTO } from '@shared/models/dto/PostCommentDTO';

export interface PostCommentsUpdatedParams {
  type: 'comment_added' | 'comment_deleted' | 'comment_updated';
  comment?: PostCommentDTO;
}
