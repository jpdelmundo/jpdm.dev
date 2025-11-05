const isNode = typeof process !== 'undefined' && process.versions?.node;

export const jsonBase64Encode = (obj: unknown)=>{
    const json = JSON.stringify(obj);
    return isNode
        ? Buffer.from(json, 'utf-8').toString('base64')
        : btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj))));
}

export const jsonBase64Decode = (str: string)=>{
    return JSON.parse(
        isNode
        ? Buffer.from(str, 'base64').toString('utf-8')
        : new TextDecoder().decode(Uint8Array.from(atob(str), c=>c.charCodeAt(0)))
    );
}