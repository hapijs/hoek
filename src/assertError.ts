export class AssertError extends Error {
    name = 'AssertError' as const;

    constructor(message?: string | undefined | null, ctor?: Function) {
        super(message || 'Unknown error');

        /* v8 ignore next 3 -- captureStackTrace is always present on V8/Node; the guard is for non-V8 runtimes */
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, ctor);
        }
    }
}
