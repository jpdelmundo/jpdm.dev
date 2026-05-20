import { DateComparison } from '../types/DateComparison.js';
import { RESERVED_USERNAME } from '../types/ReservedUsername.js';

export const validatePassword = (value: string) => {
  const errors = [];

  if (value.length < 8) errors.push('At least 8 characters long');
  if (value.length > 255)
    errors.push('Password too long (max: 255 characters)');
  if (!/[a-z]/.test(value)) errors.push('At least one lowercase letter');
  if (!/[A-Z]/.test(value)) errors.push('At least one uppercase letter');
  if (!/\d/.test(value)) errors.push('At least one number');
  if (!/[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~`]/.test(value))
    errors.push('At least one special character');

  return errors;
};

export const validateUsername = (value: string) => {
  const errors = [];

  if (value.length < 3) errors.push('Username length too short');
  if (value.length > 30) errors.push('Username length too long');
  if (!/^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)?$/i.test(value))
    errors.push(
      'Usernames may contain letters and numbers, and may include a single optional underscore (_).',
    );
  if (RESERVED_USERNAME.includes(value.toLocaleLowerCase()))
    errors.push('Invalid username');

  return errors;
};

export const isValidEmail = (email: string) => {
  return /^[a-zA-Z0-9_%+-]+(?:\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/.test(
    email,
  );
};

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