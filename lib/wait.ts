const maxTimer = 2 ** 31 - 1; // ~25 days


interface Options {

    /**
     * setTimeout function to be used by wait.
     * @param callback - A function to be executed after the timer expires.
     * @param delay - The time, in milliseconds that the timer should wait before the specified function is executed.
     *
     */
    readonly setTimeout?: (callback: Function, delay: number) => void;
}

/**
 * Returns a Promise that resolves after the requested timeout.
 *
 * @param timeout - The number of milliseconds to wait before resolving the Promise.
 * @param returnValue - The value that the Promise will resolve to.
 *
 * @return A Promise that resolves with `returnValue`.
 */
export function wait<T>(
    timeout?: bigint | number | undefined,
    returnValue?: T,
    options?: Options
) {

    if ((typeof timeout !== 'number' && typeof timeout !== 'bigint') && timeout !== undefined) {
        throw new TypeError('Timeout must be a number or bigint');
    }

    if (typeof timeout === 'bigint') {
        timeout = Number(timeout);
    }

    if (timeout! >= Number.MAX_SAFE_INTEGER) {         // Thousands of years
        timeout = Infinity;
    }


    return new Promise((resolve) => {

        const _setTimeout = options?.setTimeout ?? setTimeout;

        const activate = () => {

            const time = Math.min(timeout as number, maxTimer);

            timeout = timeout as number - time;

            _setTimeout(() => (timeout as number > 0 ? activate() : resolve(returnValue)), time);
        };

        if (timeout !== Infinity) {
            activate();
        }
    });
}
