/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Determines if an object is a promise.
 *
 * @param promise - the object tested.
 *
 * @returns true if the object is a promise, otherwise false.
 */
export const isPromise = function (promise: any):promise is Promise<unknown> {

    return typeof promise?.then === 'function';
};
