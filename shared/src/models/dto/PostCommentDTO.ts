import { PostComment } from '../generated/PostComment';

export interface PostCommentDTO extends PostComment {
    display_name: string;
}