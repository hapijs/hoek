import { assert } from './assert.js';
import { clone } from './clone.js';
import * as Utils from './utils.js';

export type MergeTypes<T1, T2> = {
    [K in keyof T1]: K extends keyof T2 ? T2[K] | T1[K] : T1[K];
} & {
    [K in keyof T2]: K extends keyof T1 ? T2[K] | T1[K] : T2[K];
};

export interface MergeOptions {

    /**
     * Clone the object's prototype.
     *
     * @default true
     */
    prototype?: boolean | undefined;

    /**
     * Include symbol properties.
     *
     * @default true
     */
    symbols?: boolean | undefined;

    /**
     * Shallow clone the specified keys.
     *
     * @default undefined
     */
    shallow?: string[] | string[][] | boolean | undefined;

    /**
     * When true, arrays are merged together.
     */
    mergeArrays?: boolean | undefined;


    /**
     * When true, null value from source overrides target.
     */
    nullOverride?: boolean | undefined;
}

export function merge <T1 extends object>(target: T1, source: null | undefined, options?: MergeOptions): T1;
export function merge <T1 extends object, T2 extends object>(target: T1, source: T2, options?: MergeOptions): MergeTypes<T1, T2>;
export function merge <T1 extends object, T2 extends object>(target: T1, source: T2, options: MergeOptions = {}) {

    assert(target && typeof target === 'object', 'Invalid target value: must be an object');
    assert(source === null || source === undefined || typeof source === 'object', 'Invalid source value: must be null, undefined, or an object');

    if (!source) {
        return target as T1;
    }

    options = Object.assign({ nullOverride: true, mergeArrays: true }, options);

    if (Array.isArray(source)) {

        assert(Array.isArray(target), 'Cannot merge array onto an object');

        if (!options.mergeArrays) {

            // Must not change target assignment
            target.length = 0;
        }

        for (let i = 0; i < source.length; ++i) {
            target.push(clone(source[i], { symbols: options.symbols }));
        }

        return target as MergeTypes<T1, T2>;
    }

    const keys = Utils.keys(source, options);

    for (let i = 0; i < keys.length; ++i) {

        const key = keys[i]!;

        if (key === '__proto__' ||
            !Object.prototype.propertyIsEnumerable.call(source, key)) {

            continue;
        }

        const value = source[key];

        if (
            value &&
            typeof value === 'object'
        ) {

            const current = target[key as unknown as keyof T1];

            if (current === value) {

                continue; // Can occur for shallow merges
            }

            if (
                !current ||
                typeof current !== 'object' ||
                (Array.isArray(current) !== Array.isArray(value)) ||
                value instanceof Date ||
                (Buffer && Buffer.isBuffer(value)) || // $lab:coverage:ignore$
                value instanceof RegExp
            ) {

                // @ts-expect-error - Not possible to express this in TS at q
                target[key] = clone(value, { symbols: options.symbols });
            }
            else {
                merge(current, value, options);
            }
        }
        else {

            // Explicit to preserve empty strings
            if (
                value !== null &&
                value !== undefined
            ) {

                // @ts-expect-error - Not possible to express this in TS at q
                target[key] = value;
            }
            else if (options.nullOverride) {
                // @ts-expect-error - Not possible to express this in TS at q
                target[key] = value;
            }
        }
    }

    return target as MergeTypes<T1, T2>;
}

