import type { ApiResult } from '@shared/types/ApiResult';
import type { ImageDetail } from '@shared/types/ImageDetail';
import type { ImageOrientation } from '@shared/types/ImageOrientation';

export const fieldErrorProps = (errors: Record<string, string>, fieldName: string) => {
    return { error: !!errors[fieldName], helperText: errors[fieldName] || ' ' };
}

export const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
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