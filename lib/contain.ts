/* eslint-disable func-style */
import { assert as Assert } from './assert';
import { deepEqual as DeepEqual } from './deepEqual';
import { escapeRegex } from './escapeRegex';
import * as Utils from './utils';

// Partial one or many
type PartOOM<T> = Partial<T> | Partial<T>[];
type ContainValues<T = unknown> = PartOOM<string> | PartOOM<T> | PartOOM<keyof T>;

export interface ContainOptions {

    /**
     * Perform a deep comparison.
     *
     * @default false
     */
    readonly deep?: boolean;

    /**
     * Allow only one occurrence of each value.
     *
     * @default false
     */
    readonly once?: boolean;

    /**
     * Allow only values explicitly listed.
     *
     * @default false
     */
    readonly only?: boolean;

    /**
     * Allow partial match.
     *
     * @default false
     */
    readonly part?: boolean;

    /**
     * Include symbol properties.
     *
     * @default true
     */
    readonly symbols?: boolean;
}

export function contain(ref: string, values: PartOOM<string>, options?: ContainOptions): boolean;
export function contain <T>(ref: T[], values: PartOOM<T>, options?: ContainOptions): boolean;
export function contain <T>(
    ref: T,
    values: PartOOM<keyof T> | PartOOM<T>,
    options?: ContainOptions
): boolean;
export function contain(ref: unknown, values: unknown, options: ContainOptions = {}): boolean {
    // options: { deep, once, only, part, symbols }

    /*
        string -> string(s)
        array -> item(s)
        object -> key(s)
        object -> object (key:value)
    */

    if (typeof values !== 'object') {
        values = [values];
    }

    Assert(!Array.isArray(values) || values.length, 'Values array cannot be empty');

    // String

    if (typeof ref === 'string') {
        return compareString(ref, values as string[], options);
    }

    // Array

    if (Array.isArray(ref)) {
        return containArray(ref, values as [], options);
    }

    // Object

    Assert(typeof ref === 'object', 'Reference must be string or an object');

    return containObject(ref!, values as object, options);

}


const containArray = function <T> (ref: T[], values: ContainValues<T>, options:ContainOptions) {

    if (!Array.isArray(values)) {
        values = [values] as T[];
    }

    if (!ref.length) {
        return false;
    }

    if (options.only &&
        options.once &&
        ref.length !== values.length) {

        return false;
    }

    let compareFn;

    // Map values

    const map = new Map<unknown, {allowed:number;hits:number}>();
    for (const value of values) {
        if (!options.deep ||
            !value ||
            typeof value !== 'object') {

            const existing = map.get(value);
            if (existing) {
                ++existing.allowed;
            }
            else {
                map.set(value, { allowed: 1, hits: 0 });
            }
        }
        else {
            compareFn = compareFn ?? compare(options);

            let found = false;
            for (const [key, existing] of map.entries()) {
                if (compareFn(key, value)) {
                    ++existing.allowed;
                    found = true;
                    break;
                }
            }

            if (!found) {
                map.set(value, { allowed: 1, hits: 0 });
            }
        }
    }

    // Lookup values

    let hits = 0;
    for (const item of ref) {
        let match;
        if (!options.deep ||
            !item ||
            typeof item !== 'object') {

            match = map.get(item);
        }
        else {
            compareFn = compareFn ?? compare(options);

            for (const [key, existing] of map.entries()) {
                if (compareFn(key, item)) {
                    match = existing;
                    break;
                }
            }
        }

        if (match) {
            ++match.hits;
            ++hits;

            if (options.once &&
                match.hits > match.allowed) {

                return false;
            }
        }
    }

    // Validate results

    if (options.only &&
        hits !== ref.length) {

        return false;
    }

    for (const match of map.values()) {
        if (match.hits === match.allowed) {
            continue;
        }

        if (match.hits < match.allowed &&
            !options.part) {

            return false;
        }
    }

    return !!hits;
};


const containObject = function <T extends object> (ref: T, values: ContainValues, options:ContainOptions) {

    Assert(options.once === undefined, 'Cannot use option once with object');

    const keys = Utils.keys(ref, options);
    if (!keys.length) {
        return false;
    }

    // Keys list
    if (Array.isArray(values)) {

        return containArray(keys, values, options);
    }

    // Key value pairs

    const symbols = Object.getOwnPropertySymbols(values).filter((sym) => values.propertyIsEnumerable(sym));
    const targets = [...Object.keys(values), ...symbols];

    const compareFn = compare(options);
    const set = new Set(targets);

    for (const key of keys) {
        if (!set.has(key as string)) {
            if (options.only) {
                return false;
            }

            continue;
        }

        if (!compareFn(values[key as never], ref[key])) {
            return false;
        }

        set.delete(key as string);
    }

    if (set.size) {
        return options.part ? set.size < targets.length : false;
    }

    return true;
};


const compareString = function (ref: string, values: string[], options: ContainOptions) {

    // Empty string

    if (ref === '') {
        return values.length === 1 && values[0] === '' ||               // '' contains ''
            !options.once && !values.some((v) => v !== '');             // '' contains multiple '' if !once
    }

    // Map values

    const map = new Map();
    const patterns = [] as string[];

    for (const value of values) {
        Assert(typeof value === 'string', 'Cannot compare string reference to non-string value');

        if (value) {
            const existing = map.get(value);
            if (existing) {
                ++existing.allowed;
            }
            else {
                map.set(value, { allowed: 1, hits: 0 });
                patterns.push(escapeRegex(value));
            }
        }
        else if (options.once ||
            options.only) {

            return false;
        }
    }

    if (!patterns.length) {                     // Non-empty string contains unlimited empty string
        return true;
    }

    // Match patterns

    const regex = new RegExp(`(${patterns.join('|')})`, 'g');
    const leftovers = ref.replace(regex, ($0, $1) => {

        ++map.get($1).hits;
        return '';                              // Remove from string
    });

    // Validate results

    if (options.only &&
        leftovers) {

        return false;
    }

    let any = false;
    for (const match of map.values()) {
        if (match.hits) {
            any = true;
        }

        if (match.hits === match.allowed) {
            continue;
        }

        if (match.hits < match.allowed &&
            !options.part) {

            return false;
        }

        // match.hits > match.allowed

        if (options.once) {
            return false;
        }
    }

    return !!any;
};


const compare = function (options: ContainOptions) {

    if (!options.deep) {
        return shallow;
    }

    const hasOnly = options.only !== undefined;
    const hasPart = options.part !== undefined;

    const flags = {
        prototype: hasOnly ? options.only : hasPart ? !options.part : false,
        part: hasOnly ? !options.only : hasPart ? options.part : false
    };

    return <A, B>(a: A, b: B) => DeepEqual(a, b, flags);
};


const shallow = function (a: unknown, b: unknown) {

    return a === b;
};
