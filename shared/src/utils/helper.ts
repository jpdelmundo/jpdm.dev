import z from 'zod';
import { type UserProfile } from '../models/generated/UserProfile.js';

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

export function getAvatarProps({ username, profile }: { username: string, profile: Pick<UserProfile, 'avatar_url' | 'first_name' | 'last_name'> | null }) {
    const name = profile ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() : '';
    return {
        display_name: name || username || '',
        avatar_url: profile?.avatar_url || '',
    };
}

export const randomString = (length: number) => {
    const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil(length / 2)));
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, length);
}

export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
        if (key in obj) {
            result[key] = obj[key];
        }
    }
    return result;
}

export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}