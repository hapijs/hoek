import { assert } from './assert';
import { clone, ShallowKeys } from './clone';
import { merge } from './merge';
import { reach } from './reach';

export type ApplyToDefaultsOptions = {
    /**
     * When true, null value from `source` overrides existing value in `target`.
     */
    nullOverride?: boolean;
    /**
     * Shallow clone the specified keys.
     */
    shallow?: boolean | ShallowKeys;
}

export type Falsy = null | false | 0 | '' | undefined;

export const applyToDefaults = function <T extends object> (
    defaults: Partial<T>,
    source: Partial<T> | Falsy | true,
    options: ApplyToDefaultsOptions = {}
) {

    assert(defaults && typeof defaults === 'object', 'Invalid defaults value: must be an object');
    assert(!source || source === true || typeof source === 'object', 'Invalid source value: must be true, falsy or an object');
    assert(typeof options === 'object', 'Invalid options: must be an object');

    if (!source) {                                                  // If no source, return null
        return null;
    }

    if (options.shallow) {
        return applyToDefaultsWithShallow(defaults, source, options);
    }

    const copy = clone(defaults);

    if (source === true) {                                          // If source is set to true, use defaults
        return copy;
    }

    const nullOverride = options.nullOverride !== undefined ? options.nullOverride : false;
    return merge(copy, source, { nullOverride, mergeArrays: false });
};


const applyToDefaultsWithShallow = function <T extends object, U extends object> (defaults: T, source: U | true, options: ApplyToDefaultsOptions) {

    const keys = options.shallow;
    assert(Array.isArray(keys), 'Invalid keys');

    const seen = new Map();
    const _merge = source === true ? null : new Set();

    for (const k of keys) {
        const key = Array.isArray(k) ? k : (k as string).split('.');            // Pre-split optimization

        const ref = reach(defaults!, key as string[]);
        if (ref &&
            typeof ref === 'object') {

            seen.set(ref, _merge && reach(source as U, key as string[]) || ref);
        }
        else if (_merge) {
            _merge.add(key);
        }
    }

    const copy = clone(defaults, {}, seen);

    if (!_merge) {
        return copy;
    }

    for (const key of _merge) {
        reachCopy(copy, source as U, key as string[]);
    }

    const nullOverride = options.nullOverride !== undefined ? options.nullOverride : false;

    return merge(copy, source, { nullOverride, mergeArrays: false });
};


const reachCopy = function <T extends object, U extends object> (dst: T, src: U, path: string[]) {

    for (const segment of path) {
        if (!(segment in src)) {
            return;
        }

        const val = src[segment as keyof U];

        if (typeof val !== 'object' || val === null) {
            return;
        }

        src = val as U;
    }

    const value = src;
    let ref = dst;

    for (let i = 0; i < path.length - 1; ++i) {

        const segment = path[i] as keyof T;

        if (typeof ref[segment] !== 'object') {

            // @ts-expect-error - we know that ref[segment] is an object
            ref[segment] = {};
        }

        ref = ref[segment] as T;
    }

    // @ts-expect-error - we know that ref is an object
    ref[path[path.length - 1]] = value;
};
