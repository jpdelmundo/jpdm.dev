import { PostStatsDTO } from './PostStatsDTO.js';
import { PostViewsDTO } from './PostViewsDTO.js';

export type UserStatsDTO = {
    stats: PostStatsDTO | null;
    post_views: PostViewsDTO[];
};