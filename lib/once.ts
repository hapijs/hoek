const wrapped = Symbol('wrapped');

interface WrappedFunction {
    (...args: unknown[]): unknown;
    [wrapped]?: boolean;
}

export const once = function <T extends WrappedFunction> (method: T): T {

    if (method[wrapped]) {
        return method;
    }

    let once = false;
    const wrappedFn = function (...args: Parameters<T>): ReturnType<T> {

        if (!once) {
            once = true;
            method(...args);
        }
    };

    wrappedFn[wrapped] = true;
    return wrappedFn;
};
