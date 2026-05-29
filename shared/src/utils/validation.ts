import z from 'zod';
import { DateComparison } from '../types/DateComparison.js';
import { RESERVED_USERNAME } from '../types/ReservedUsername.js';

export const passwordSchema = z.string().superRefine((value, ctx) => {
  if (value.length < 8) ctx.addIssue({ code: 'custom', message: 'At least 8 characters long' });
  if (value.length > 255) ctx.addIssue({ code: 'custom', message: 'Password too long (max: 255 characters)' });
  if (!/[a-z]/.test(value)) ctx.addIssue({ code: 'custom', message: 'At least one lowercase letter' });
  if (!/[A-Z]/.test(value)) ctx.addIssue({ code: 'custom', message: 'At least one uppercase letter' });
  if (!/\d/.test(value)) ctx.addIssue({ code: 'custom', message: 'At least one number' });
  if (!/[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~`]/.test(value)) ctx.addIssue({ code: 'custom', message: 'At least one special character' });
});

export const validatePassword = (value: string): string[] => {
  const result = passwordSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((e) => e.message);
};

export const usernameSchema = z.string().superRefine((value, ctx) => {
  if (value.length < 3) ctx.addIssue({ code: 'custom', message: 'Username length too short' });
  if (value.length > 30) ctx.addIssue({ code: 'custom', message: 'Username length too long' });
  if (!/^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)?$/i.test(value)) ctx.addIssue({ code: 'custom', message: 'Usernames may contain letters and numbers, and may include a single optional underscore (_).' });
  if (RESERVED_USERNAME.includes(value.toLocaleLowerCase())) ctx.addIssue({ code: 'custom', message: 'Invalid username' });
});

export const validateUsername = (value: string): string[] => {
  const result = usernameSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((i) => i.message);
};

export const isValidEmail = (email: string) => {
  return /^[a-zA-Z0-9_%+-]+(?:\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/.test(
    email,
  );
};

export const validateEmail = (value: string) => {
  const result = emailSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map(i => i.message);
}

export const emailSchema = z.string().superRefine((value, ctx) => {
  if (value.length > 255) ctx.addIssue('Email length too long');
  if (!/^[a-zA-Z0-9_%+-]+(?:\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/i.test(value)) ctx.addIssue('Please enter a valid email address');
});

export const isNumber = (val: unknown) => {
  return typeof val === 'number' && Number.isFinite(val);
};

export const isValidDate = (input: unknown) => input instanceof Date || !isNaN(new Date(String(input)).getTime());

export const isValidDateComparison = (input: unknown) => {
  if (typeof input !== 'object' || input === null) return false;
  const entry = Object.entries(input)[0];
  if (!entry) return false;
  const [key, value] = entry;

  switch (key) {
    case 'eq':
    case 'lt':
    case 'lte':
    case 'gt':
    case 'gte': return isValidDate(value);
    case 'between': return Array.isArray(value) && value.length === 2 && value.every(isValidDate);
    case 'isNull':
    case 'isNotNull': return value === true;
    default: return false;
  }
}

export type ValidType = StringConstructor | BooleanConstructor | NumberConstructor | DateConstructor | string[] | typeof DateComparison;
export const isValid = (input: unknown, validType: ValidType): boolean => {
  if (validType == String) return typeof input === 'string';
  if (validType == Boolean) return typeof input === 'boolean';
  if (validType == Number) return typeof input === 'number';
  if (validType == Date) return isValidDate(input);
  if (validType == DateComparison) return isValidDateComparison(input);
  if (Array.isArray(validType)) return validType.includes(input as string);
  return false;
}