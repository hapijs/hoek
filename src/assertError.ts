export class AssertError extends Error {
    name = 'AssertError' as const;

    constructor(message?: string | undefined | null, ctor?: Function) {
        super(message || 'Unknown error');
        Error.captureStackTrace(this, ctor);
    }
}
