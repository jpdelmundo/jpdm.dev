export type FindParamsBase = Record<string, unknown>;
export type FindParamsPaginated = FindParamsBase & { page_num: number; page_size: number; }