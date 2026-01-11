import type { ApiResult } from '@shared/types/ApiResult';
import type { ImageDetail } from '@shared/types/ImageDetail';
import type { ImageOrientation } from '@shared/types/ImageOrientation';

export const fieldErrorProps = (errors: Record<string, string>, fieldName: string) => {
    return { error: !!errors[fieldName], helperText: errors[fieldName] || ' ' };
}

export const getErrorMessage = (result: ApiResult<unknown>) => {
    return result.error?.message || 'Something went wrong';
}

export const getDimensionOrientation = (width: number | null, height: number | null): ImageOrientation => {
    if (!width || !height) return 'unknown';
    return width > height
        ? 'landscape'
        : width < height
            ? 'portrait'
            : 'square';
}

export const getImageFileDetail = (file: File): Promise<ImageDetail> => {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.src = url;

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                url,
                width: img.naturalWidth,
                height: img.naturalHeight
            });
        }

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({
                url: '',
                width: 0,
                height: 0
            });
        };
    });
}

export const formatDateTime = (dateTime: Date | string, locale: string = navigator.language) => {
    const dateFormatter = new Intl.DateTimeFormat(locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const timeFormatter = new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    const dt = typeof dateTime == 'string' ? new Date(dateTime) : dateTime;

    return `${dateFormatter.format(dt)} ${timeFormatter.format(dt)}`;
}

export const getRelativeTime = (dateTime: string, locale: string = navigator.language) => {
    const date = new Date();
    const past = new Date(dateTime);
    const diff = (past.getTime() - date.getTime()) / 1000; //ms to s

    const minutes = diff / 60;
    const hours = diff / 3600;
    const days = diff / 86400;

    if (Math.abs(days) >= 1) {
        return past.toLocaleString(locale);
    }

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    if (Math.abs(hours) >= 1) {
        return rtf.format(Math.round(hours), 'hour');
    }

    if (Math.abs(minutes) >= 1) {
        return rtf.format(Math.round(minutes), 'minute');
    }

    return rtf.format(Math.round(diff), 'second');
}

export function hashString(str: string) {
    // DJB2 hash algorithm
    let hash = 5381;

    for (let i = 0; i < str.length; i++) {
        //left shift 5 bits
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }

    // convert to 32-bit int
    return (hash >>> 0);
}

export function stringToHexColor(str: string) {
    return '#' + hashString(str).toString(16).padStart(6, '0');
}

export function stringToHslColor(str: string) {
    return `hsl(${hashString(str) % 360}, 70%, 60%)`;
}

export function scrollIntoView(el: Element, offsetTop: number = 0) {
    if (!el) return;
    const elTop = el.getBoundingClientRect().top;
    const top = window.scrollY + elTop - offsetTop;
    window.scrollTo({ top, behavior: 'smooth' });
}

export function isTopInView(el: Element, offsetTop: number = 0) {
    if (!el) return false;
    const elTop = el.getBoundingClientRect().top;
    return elTop > (0 + offsetTop);
}

export function formatCounters(num: number) {
    if (!num) return '';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(num);
}

export async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        console.log('Cannot copy to clipboard');
    }
}

export function scrollbarWidthAware(apply: boolean) {
    if (apply) {
        const hasScrollbar = document.body.scrollHeight > window.innerHeight - 60; //60 is header height
        if (hasScrollbar) {
            const scrollbarWidth = window.innerWidth - document.body.clientWidth;
            //document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
            //document.body.classList.add('modal-dialog-open');
            const el = document.querySelector('.header-container') as HTMLElement;
            el.style.width = `calc(100% - ${scrollbarWidth}px)`;
            document.documentElement.classList.add('modal-dialog-open');
        }
    } else {
        const el = document.querySelector('.header-container') as HTMLElement;
        el.style.width = '';
        document.documentElement.classList.remove('modal-dialog-open');
        //document.body.classList.remove('modal-dialog-open');
        //document.documentElement.style.removeProperty('--scrollbar-width');
    }
}