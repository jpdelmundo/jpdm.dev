export function escapeLiteral(val: any): string {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return String(val);
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (val instanceof Date) return `'${val.toISOString()}'`;
    if (Array.isArray(val)) {
        return `ARRAY[${val.map(escapeLiteral).join(', ')}]`;
    }
    if (Object.prototype.toString.call(val) === '[object Object]') {
        const json = JSON.stringify(val).replace(/'/g, "''");
        return `'${json}'::jsonb`;
    }

    return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

export function getFullQuery(text: string, values: any[] = []) {
    return text.replace(/\$(\d+)/g, (_, n) => {
        const val = values[Number(n) - 1];
        return escapeLiteral(val);
    });
}