import sharp from "sharp";

interface CompressOptions {
    maxWidth?: number;
    maxHeight?: number;
    maxFileSize?: number;
    format: 'webp' | 'jpeg'
}

export const compress = async (input: Buffer | string, options: CompressOptions) => {
    const { maxWidth = 1920, maxHeight = 1080, maxFileSize = (1024 * 150), format } = options;
    let quality = 85;
    let output: Buffer;

    do {
        const resized = sharp(input).resize({
            width: maxWidth as number,
            height: maxHeight as number,
            fit: 'inside',
            withoutEnlargement: true
        });

        output = format === 'jpeg'
            ? await resized.jpeg({ quality, mozjpeg: true }).toBuffer()
            : await resized.webp({ quality }).toBuffer();

        quality -= 5;
    } while (output.length > maxFileSize && quality >= 40)

    return output;
}