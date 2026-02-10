import type { DateComparison } from "@shared/types/DateComparison.js";

export function escapeLiteral(val: unknown): string {
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

export function getFullQuery(text: string, values: unknown[] = []) {
    return text.replace(/\$(\d+)/g, (_, n) => {
        const val = values[Number(n) - 1];
        return escapeLiteral(val);
    });
}

export function getDateParamCondition(column: string, condition: DateComparison, values: unknown[]): string {
    const entries = Object.entries(condition);
    if (!entries || !entries[0] || entries.length == 0) return '';

    const [key, val] = entries[0];
    if (key == 'eq') {
        values.push(val);
        return `${column} = $${values.length}`;
    }

    if (key == 'lt') {
        values.push(val);
        return `${column} < $${values.length}`;
    }

    if (key == 'lte') {
        values.push(val);
        return `${column} <= $${values.length}`;
    }

    if (key == 'gt') {
        values.push(val);
        return `${column} > $${values.length}`;
    }

    if (key == 'gte') {
        values.push(val);
        return `${column} >= $${values.length}`;
    }

    if (key == 'between') {
        const [start, end] = val;
        values.push(start, end);
        return `${column} between $${values.length - 1} and $${values.length}`;
    }

    if (key == 'isnull') {
        return `${column} is ${val ? 'null' : 'not null'}`;
    }

    return '';
}