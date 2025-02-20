const wrapped = Symbol('wrapped');

interface WrappedFunction {
    (...args: any[]): any;
    [wrapped]?: boolean | undefined;
}

export function once <T extends WrappedFunction>(method: T): T {

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
}
