import { useState } from 'react';

export type ValidationRuleFunction = (value: string) => string;
export type ValidationRules = Record<string, ValidationRuleFunction>;

const validate = (fields: Record<string, string>, validationRules: ValidationRules) => {
    const newErrors: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
        const rule = validationRules[key as keyof typeof validationRules];
        if (rule) {
            const error = rule(value);
            if (error) newErrors[key] = error;
        }
    }
    return newErrors;
}

export const useFormValidation = <T extends Record<string, any>>(validationRules: Record<keyof T, ValidationRuleFunction>) => {
    const [errors, setErrors] = useState({});

    const validateForm = (values: T): boolean => {
        const newErrors = validate(values, validationRules);
        setErrors(newErrors);
        return Object.keys(newErrors).length == 0;
    };

    const validateField = (name: keyof T, value: T[keyof T]) => {
        const fieldErrors = validate({ [name]: value }, validationRules);
        setErrors(prev => ({
            ...prev,
            ...fieldErrors
        }));
    };

    return { errors, validateField, validateForm, setErrors };
}