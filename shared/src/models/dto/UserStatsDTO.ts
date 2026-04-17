import type { PostStatsDTO } from './PostStatsDTO.js';
import type { PostViewsDTO } from './PostViewsDTO.js';

export type UserStatsDTO = {
    stats: PostStatsDTO | null;
    post_views: PostViewsDTO[];
};