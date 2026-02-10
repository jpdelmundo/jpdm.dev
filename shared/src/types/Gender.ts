export const Gender = {
    MALE: { value: 'male', text: 'Male' },
    FEMALE: { value: 'female', text: 'Female' },
    NON_BINARY: { value: 'non-binary', text: 'Non-binary' },
    UNKNOWN: { value: 'unknown', text: 'Prefer not to say' }
} as const;

export type Gender = typeof Gender[keyof typeof Gender]['value'];

export const genderText = (gender: Gender) => {
    return Object.values(Gender).find(item => item.value == gender)?.text;
}