import crypto from 'node:crypto';

export const randomString = (length: number) => {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

export const checkRequiredParameter = (param: Record<string, unknown>): void => {
    for (const [key, value] of Object.entries(param)) {
        if (value == null) throw new Error(`Missing required parameter: ${key}`);
    }
}

export function escapeHtml(str: string | null): string {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}