const internals = {
  maxTimer: 2 ** 31 - 1              // ~25 days
};


interface Options {

  /**
   * setTimeout function to be used by wait.
   *
   */
  readonly setTimeout?: (
    /**
     *
     * @param callback - A function to be executed after the timer expires.
     * @param delay - The time, in milliseconds that the timer should wait before the specified function is executed.
     *
     */
    callback: Function, delay: number) => void;
}

/**
 * Returns a Promise that resolves after the requested timeout.
 *
 * @param timeout - The number of milliseconds to wait before resolving the Promise.
 * @param returnValue - The value that the Promise will resolve to.
 *
 * @return A Promise that resolves with `returnValue`.
 */
export function wait<T>(timeout?: number, returnValue?: T, options?: Options) {

  if (typeof timeout === 'bigint') {
    timeout = Number(timeout);
  }

  if (timeout >= Number.MAX_SAFE_INTEGER) {         // Thousands of years
    timeout = Infinity;
  }

  if (typeof timeout !== 'number' && timeout !== undefined) {
    throw new TypeError('Timeout must be a number or bigint');
  }

  return new Promise((resolve) => {

    const _setTimeout = options ? options.setTimeout : setTimeout;

    const activate = () => {

      const time = Math.min(timeout, internals.maxTimer);
      timeout -= time;
      _setTimeout(() => (timeout > 0 ? activate() : resolve(returnValue)), time);
    };

    if (timeout !== Infinity) {
      activate();
    }
  });
}
