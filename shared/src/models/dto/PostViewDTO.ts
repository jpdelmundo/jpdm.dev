import { type PostComment } from '../generated/PostComment.js';

export interface PostCommentDTO extends PostComment {
    display_name: string;
}