import z from 'zod';

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

export function capitalized(input: string): string {
    if (!input) return '';
    return input.charAt(0).toUpperCase() + input.slice(1);
}

export function parseBoolean(input: unknown): boolean | undefined {
    return input === 'true' ? true : input === 'false' ? false : undefined;
}

export function coercedBoolean() {
    return z.union([z.boolean(), z.string().transform(v => v === 'true')]);
}