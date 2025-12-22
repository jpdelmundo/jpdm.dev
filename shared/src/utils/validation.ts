export const validatePassword = (value: string) => {
    const errors = [];

    if (value.length < 8) errors.push('At least 8 characters long');
    if (value.length > 255) errors.push('Password too long (max: 255 characters)');
    if (!/[a-z]/.test(value)) errors.push('At least one lowercase letter');
    if (!/[A-Z]/.test(value)) errors.push('At least one uppercase letter');
    if (!/\d/.test(value)) errors.push('At least one number');
    if (!/[!@#$%^&*()_\-+={}[\]\|:;"'<>,.?/~`]/.test(value)) errors.push("At least one special character");

    return errors;
}

export const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9_%+-]+(?:\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/.test(email);
}

export const isNumber = (val: unknown) => {
    return typeof val === 'number' && Number.isFinite(val);
}