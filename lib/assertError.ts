export class AssertError extends Error {

    name = 'AssertError' as const;

    constructor(message?: string | undefined | null, ctor?: Function) {

        super(message || 'Unknown error');

        if (typeof Error.captureStackTrace === 'function') {            // $lab:coverage:ignore$
            Error.captureStackTrace(this, ctor);
        }
    }
}
