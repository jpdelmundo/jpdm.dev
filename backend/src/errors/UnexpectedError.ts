export class UnexpectedError extends Error {
    constructor(message?: string) {
        super('Unexpected error' + (message ? `: ${message}` : ''));
        this.name = 'UnexpectedError';
    }
}