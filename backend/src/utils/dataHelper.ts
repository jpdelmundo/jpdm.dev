export function isPaginated(params: Record<string, unknown>) {
    return 'page_num' in params || 'page_size' in params;
}