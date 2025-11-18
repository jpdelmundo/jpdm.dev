import type { Paginated } from '@shared/types/Paginated';

export type InferPaginatedResult<P, T> =
    P extends { page_num?: number; }
    ? Paginated<T>
    : P extends { page_size?: number; } ? Paginated<T> : T[];