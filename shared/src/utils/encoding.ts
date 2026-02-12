const isNode = process && typeof process !== 'undefined' && process.versions && process.versions.node;

export const jsonBase64Encode = (obj: unknown) => {
    const json = JSON.stringify(obj);

    //node
    if (isNode) {
        return Buffer.from(json).toString('base64');
    }

    //browser
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary);
};

export const jsonBase64Decode = (str: string) => {
    let jsonString: string;

    if (isNode) {
        //node
        jsonString = Buffer.from(str, 'base64').toString();
    } else {
        //browser
        const binary = atob(str);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        jsonString = new TextDecoder().decode(bytes);
    }

    return JSON.parse(jsonString);
};