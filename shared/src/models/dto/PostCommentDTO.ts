import { type PostComment } from '../generated/PostComment.js';
import type PostDTO from './PostDTO.js';

export interface PostCommentDTO extends Omit<PostComment, 'user_id'> {
    is_owner: boolean;
    display_name: string;
    avatar_url: string;
    post?: PostDTO;
}