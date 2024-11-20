/**
 * Determines if an object is a promise.
 *
 * @param promise - the object tested.
 *
 * @returns true if the object is a promise, otherwise false.
 */
export const isPromise = function (promise: unknown): promise is Promise<unknown> {

    return typeof (promise as Promise<any>)?.then === 'function';
};
