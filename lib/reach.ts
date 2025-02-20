import { assert } from './assert.js';

export interface ReachOptions {

    /**
     * String to split chain path on. Defaults to '.'.
     *
     * @default false
     */
    readonly separator?: string;

    /**
     * Value to return if the path or value is not present. No default value.
     *
     * @default false
     */
    readonly default?: any;

    /**
     * If true, will throw an error on missing member in the chain. Default to false.
     *
     * @default false
     */
    readonly strict?: boolean;

    /**
     * If true, allows traversing functions for properties. false will throw an error if a function is part of the chain.
     *
     * @default true
     */
    readonly functions?: boolean;

    /**
     * If true, allows traversing Set and Map objects for properties. false will return undefined regardless of the Set or Map passed.
     *
     * @default false
     */
    readonly iterables?: boolean;
}

/**
 * Convert an object key chain string to reference.
 *
 * @param obj - the object from which to look up the value.
 * @param chain - the string path of the requested value. The chain string is split into key names using `options.separator`, or an array containing each individual key name. A chain including negative numbers will work like a negative index on an array.
 * @param options - optional settings. Can be a string with the separator character, or ReachOptions
 *
 * @return The value referenced by the chain if found, otherwise undefined. If chain is null, undefined, or false, the object itself will be returned.
 */
export const reach = <T>(
    obj: object | null,
    chain?: string | (string | number | symbol)[] | false | null | undefined,
    options?: ReachOptions | string
):T => {

    if (chain === false ||
        chain === null ||
        chain === undefined) {

        return obj as T;
    }

    options = options || {};

    if (typeof options === 'string') {
        options = { separator: options };
    }

    const isChainArray = Array.isArray(chain);

    assert(!isChainArray || !options.separator, 'Separator option is not valid for array-based chain');

    const path = isChainArray ? chain : chain.split(options.separator || '.');
    let ref = obj;
    for (let i = 0; i < path.length; ++i) {
        let key = path[i];
        const isSetType = isSet(ref);
        const isMapType = isMap(ref);
        const isIterable = isSetType || isMapType;

        if (isIterable && !options.iterables) {
            ref = options.default;
            break;
        }

        if (Array.isArray(ref) || isSetType) {

            const number = Number(key);

            if (Number.isInteger(number)) {
                const length = isSetType ? (ref as Set<any>).size : (ref as Array<any>).length;
                key = number < 0 ? length + number : number;
            }
        }

        if (
            !ref ||
            (typeof ref === 'function' && options.functions === false) ||         // Defaults to true
            (!isIterable && ref[key as keyof typeof ref] === undefined)
        ) {

            assert(!options.strict || i + 1 === path.length, 'Missing segment', key!, 'in reach path ', chain);
            assert(
                typeof ref === 'object' || options.functions === true || typeof ref !== 'function',
                'Invalid segment', key!, 'in reach path ', chain
            );
            ref = options.default;
            break;
        }

        if (!isIterable) {
            ref = ref[key as keyof typeof ref];
        }
        else if (isSetType) {
            ref = [...(ref as Set<any>)][Number(key)];
        }
        else if (isMapType) {  // type === 'map'
            ref = (ref as Map<any, any>).get(key);
        }
    }

    return ref as T;
};

const isSet = function (ref: unknown): ref is Set<any> {

    return ref instanceof Set;
};

const isMap = function (ref: unknown): ref is Map<any, any> {

    return ref instanceof Map;
};
