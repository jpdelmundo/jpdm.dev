import type { Paginated } from '@shared/types/Paginated.js';

export type InferFindResultType<P, T> =
    P extends { page_num: unknown } | { page_size: unknown }
    ? Paginated<T>
    : T[];