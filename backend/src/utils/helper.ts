import crypto from 'node:crypto';

export const randomString = (length: number) => {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

export const checkRequiredParameter = (param: Record<string, unknown>): void => {
    for (const [key, value] of Object.entries(param)) {
        if (value == null) throw new Error(`Missing required parameter: ${key}`);
    }
}