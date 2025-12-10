import { type Comment } from '../generated/Comment';

export interface CommentDTO extends Comment {
    display_name: string;
}