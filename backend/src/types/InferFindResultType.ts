import type { Paginated } from '@shared/types/Paginated';

export type InferFindResultType<P, T> =
    P extends { page_num: number } | { page_size: number }
    ? Paginated<T>
    : T[];