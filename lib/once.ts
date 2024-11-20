const wrapped = Symbol('wrapped');

interface WrappedFunction {
    (...args: unknown[]): unknown;
    [wrapped]?: boolean;
}

export const once = function <T extends WrappedFunction> (method: T): T {

    if (method[wrapped]) {
        return method;
    }

    let didRun = false;

    const wrappedFn = function (...args: Parameters<T>) {

        if (!didRun) {
            didRun = true;
            method(...args);
        }
    };

    wrappedFn[wrapped] = true;

    return wrappedFn as T;
};
