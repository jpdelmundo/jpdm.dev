export function alphanumericOnly(input: string): string {
    if (!input) return '';
    return input
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export function slugFormat(input: string): string {
    if (!input) return '';
    return alphanumericOnly(input).substring(0, 100).replace(/\s+/g, '-');
}