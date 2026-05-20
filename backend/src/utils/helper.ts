import { ServiceError } from '@/errors/ServiceError.js';
import type { KeyValue } from '@/types/KeyValue.js';
import { ErrorCode } from '@shared/types/ErrorCode.js';
import { isValid, type ValidType } from '@shared/utils/validation.js';
import fs from 'fs';
import crypto, { randomBytes } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import path from 'path';

export const randomString = (length: number) => {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

export const checkRequiredParameter = (param: Record<string, unknown>): void => {
    for (const [key, value] of Object.entries(param)) {
        if (value == null) throw new Error(`Missing required parameter: ${key}`);
    }
}

export const escapeHtml = (str: string | null): string => {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export const moveFile = async (src: string, dest: string) => {
    await fs.promises.mkdir(path.dirname(dest), { recursive: true });
    await fs.promises.rename(src, dest).catch(async () => {
        await fs.promises.copyFile(src, dest);
        fs.promises.unlink(src).catch((e) => console.error(e));
    });
}

export const downloadImage = async (url: string, destDir: string, timeoutMs: number = 30000): Promise<string | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok || !res.body) return null;

        const contentType = res.headers.get('content-type');
        if (!contentType?.startsWith('image/')) return null;

        //check dest
        const outputDir = path.resolve(destDir);
        fs.promises.mkdir(outputDir, { recursive: true });

        //get orig filename
        const urlObj = new URL(url);
        let filename = path.basename(urlObj.pathname);

        //check if has filename
        if (!filename) {
            const ext = contentType.split('/')[1] || 'jpg';
            filename = `${randomBytes(8).toString('hex')}.${ext}`;
        }

        const outputPath = path.join(outputDir, filename);

        // const buffer = Buffer.from(await res.arrayBuffer());
        // await fs.promises.writeFile(outputPath, buffer);

        //use stream (better for memory)
        const nodeStream = Readable.from(res.body);
        const fileStream = fs.createWriteStream(outputPath);
        await pipeline(nodeStream, fileStream);
        console.log(`File downloaded ${url}: ${outputPath}`);
        return outputPath;
    } catch (error) {
        clearTimeout(timeoutId);
        console.error(`Failed to download ${url}:`, error);
        return null;
    }
}

export const getUserAvatarDir = (user_id: string) => {
    return path.posix.join('avatars', crypto.createHash('sha256').update(user_id).digest('hex').slice(0, 16));
}

export const throwIfInvalid = (input: KeyValue, validType: ValidType, code: ErrorCode = ErrorCode.INVALID_PARAMETER) => {
    const entry = Object.entries(input)[0];
    if (!entry) return;
    const [key, value] = entry;
    if (!isValid(value, validType)) {
        const sanitize = (val: unknown) => String(val).replace(/[<>"'\n\r\t]/g, '');
        const _key = sanitize(key);
        const _value = sanitize(value);
        throw new ServiceError(`Invalid parameter ${_key}: ${_value}`, code);
    }
}