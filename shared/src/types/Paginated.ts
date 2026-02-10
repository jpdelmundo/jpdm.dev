export type Paginated<T> = {
    page_items: T[];
    page_num: number;
    page_size: number;
    total: number;
}