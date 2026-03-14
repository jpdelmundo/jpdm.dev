import type PostDTO from '../extensions/PostExtended.js';
import { type Comment } from '../generated/Comment.js';

export interface CommentDTO extends Comment {
    display_name: string;
    avatar_url: string;
    post?: PostDTO;
}