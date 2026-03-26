import { type Comment } from '../generated/Comment.js';
import type PostDTO from './PostDTO.js';

export interface CommentDTO extends Comment {
    display_name: string;
    avatar_url: string;
    post?: PostDTO;
}