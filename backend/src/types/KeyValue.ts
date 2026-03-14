export type KeyValue = Record<string, unknown>;
export type KeyValueWithPagination = KeyValue & { page_num: number; page_size: number; }