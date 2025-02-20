import { prototypes, AnyPrototype, getInternalProto } from './types.js';

const internals = {
    mismatched: null
};

export interface DeepEqualOptions {

    /**
     * Compare functions with difference references by comparing their internal code and properties.
     *
     * @default false
     */
    readonly deepFunction?: boolean;

    /**
     * Allow partial match.
     *
     * @default false
     */
    readonly part?: boolean;

    /**
     * Compare the objects' prototypes.
     *
     * @default true
     */
    readonly prototype?: boolean;

    /**
     * List of object keys to ignore different values of.
     *
     * @default null
     */
    readonly skip?: (string | symbol)[];

    /**
     * Compare symbol properties.
     *
     * @default true
     */
    readonly symbols?: boolean;
}


export const deepEqual = (obj: unknown, ref: unknown, options?: DeepEqualOptions) => {

    options = Object.assign({ prototype: true }, options);

    return !!isDeepEqual(obj, ref, options, []);
};


const isDeepEqual = (obj: unknown, ref: unknown, options: DeepEqualOptions, seen: SeenEntry[]) => {

    if (obj === ref) {                                                      // Copied from Deep-eql, copyright(c) 2013 Jake Luer, jake@alogicalparadox.com, MIT Licensed, https://github.com/chaijs/deep-eql
        return obj !== 0 || 1 / obj === 1 / (ref as never);
    }

    const type = typeof obj;

    if (type !== typeof ref) {
        return false;
    }

    if (obj === null ||
        ref === null) {

        return false;
    }

    if (type === 'function') {
        if (!options.deepFunction ||
            obj!.toString() !== ref!.toString()) {

            return false;
        }

        // Continue as object
    }
    else if (type !== 'object') {
        return obj !== obj && ref !== ref;                                  // NaN
    }

    const instanceType = getSharedType(obj as object, ref, !!options.prototype);

    switch (instanceType) {
        case prototypes.buffer:
            return Buffer && Buffer.prototype.equals.call(obj, ref);        // $lab:coverage:ignore$
        case prototypes.promise:
            return obj === ref;
        case prototypes.regex:
        case prototypes.url:
            return obj!.toString() === ref!.toString();
        case internals.mismatched:
            return false;
    }

    for (let i = seen.length - 1; i >= 0; --i) {
        if (seen[i]!.isSame(obj, ref)) {
            return true;                                                    // If previous comparison failed, it would have stopped execution
        }
    }

    seen.push(new SeenEntry(obj, ref));

    try {
        return isDeepEqualObj(
            instanceType,
            obj as never,
            ref as never,
            options,
            seen
        );
    }
    finally {
        seen.pop();
    }
};


const getSharedType = function (obj: object, ref: unknown, checkPrototype: boolean) {

    if (checkPrototype) {
        if (Object.getPrototypeOf(obj) !== Object.getPrototypeOf(ref)) {
            return internals.mismatched;
        }

        return getInternalProto(obj);
    }

    const type = getInternalProto(obj);
    if (type !== getInternalProto(ref as never)) {
        return internals.mismatched;
    }

    return type;
};


const valueOf = function (obj: any) {

    const objValueOf = obj.valueOf;
    if (objValueOf === undefined) {
        return obj;
    }

    try {
        return objValueOf.call(obj);
    }
    catch (err) {
        return err;
    }
};


const hasOwnEnumerableProperty = function (obj: object, key: string | symbol | number) {

    return Object.prototype.propertyIsEnumerable.call(obj, key);
};


const isSetSimpleEqual = function (obj: unknown, ref: unknown) {

    for (const entry of Set.prototype.values.call(obj)) {
        if (!Set.prototype.has.call(ref, entry)) {
            return false;
        }
    }

    return true;
};

const isDeepEqualObj = function (
    instanceType: (typeof prototypes)[keyof typeof prototypes],
    obj: AnyPrototype,
    ref: AnyPrototype,
    options: DeepEqualOptions,
    seen: SeenEntry[]
) {

    const { keys, getOwnPropertySymbols } = Object;

    if (instanceType === prototypes.array) {

        const objArr = obj as [];
        const refArr = ref as [];

        if (options.part) {

            // Check if any index match any other index
            for (const objValue of objArr) {
                for (const refValue of refArr) {

                    if (isDeepEqual(objValue, refValue, options, seen)) {
                        return true;
                    }

                }
            }
        }
        else {

            if (objArr.length !== (refArr).length) {

                return false;
            }

            for (let i = 0; i < (objArr).length; ++i) {

                if (!isDeepEqual(objArr[i], refArr[i], options, seen)) {

                    return false;
                }
            }

            return true;
        }
    }
    else if (instanceType === prototypes.set) {

        const objSet = obj as Set<any>;
        const refSet = ref as Set<any>;

        if (objSet.size !== refSet.size) {
            return false;
        }

        if (!isSetSimpleEqual(objSet, refSet)) {

            // Check for deep equality

            const ref2 = new Set(Set.prototype.values.call(refSet));
            for (const objEntry of Set.prototype.values.call(objSet)) {
                if (ref2.delete(objEntry)) {
                    continue;
                }

                let found = false;
                for (const refEntry of ref2) {
                    if (isDeepEqual(objEntry, refEntry, options, seen)) {
                        ref2.delete(refEntry);
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    return false;
                }
            }
        }
    }
    else if (instanceType === prototypes.map) {

        const objMap = obj as Map<any, any>;
        const refMap = ref as Map<any, any>;

        if (objMap.size !== refMap.size) {
            return false;
        }

        for (const [key, value] of Map.prototype.entries.call(objMap)) {
            if (value === undefined && !Map.prototype.has.call(refMap, key)) {
                return false;
            }

            if (!isDeepEqual(value, Map.prototype.get.call(refMap, key), options, seen)) {
                return false;
            }
        }
    }
    else if (instanceType === prototypes.error) {

        const objError = obj as Error;
        const refError = ref as Error;

        // Always check name and message

        if (
            objError.name !== refError.name ||
            objError.message !== refError.message
        ) {

            return false;
        }
    }

    // Check .valueOf()

    const valueOfObj = valueOf(obj);
    const valueOfRef = valueOf(ref);
    if ((obj !== valueOfObj || ref !== valueOfRef) &&
        !isDeepEqual(valueOfObj, valueOfRef, options, seen)) {

        return false;
    }

    const objAsObject = obj as object;
    const refAsObject = ref as object;

    // Check properties

    const objKeys = keys(objAsObject);
    if (!options.part &&
        objKeys.length !== keys(refAsObject).length &&
        !options.skip) {

        return false;
    }

    let skipped = 0;
    for (const key of objKeys) {
        if (options.skip &&
            options.skip.includes(key)) {

            if (refAsObject[key as never] === undefined) {
                ++skipped;
            }

            continue;
        }

        if (!hasOwnEnumerableProperty(refAsObject, key)) {
            return false;
        }

        if (!isDeepEqual(objAsObject[key as never], refAsObject[key as never], options, seen)) {
            return false;
        }
    }

    if (!options.part &&
        objKeys.length - skipped !== keys(refAsObject).length) {

        return false;
    }

    // Check symbols

    if (options.symbols !== false) {                                // Defaults to true
        const objSymbols = getOwnPropertySymbols(obj);
        const refSymbols = new Set(getOwnPropertySymbols(ref));

        for (const key of objSymbols) {
            if (!options.skip?.includes(key)) {

                if (hasOwnEnumerableProperty(obj, key)) {
                    if (!hasOwnEnumerableProperty(ref, key)) {
                        return false;
                    }

                    if (!isDeepEqual(obj[key as never], ref[key as never], options, seen)) {
                        return false;
                    }
                }
                else if (hasOwnEnumerableProperty(ref, key)) {
                    return false;
                }
            }

            refSymbols.delete(key);
        }

        for (const key of refSymbols) {
            if (hasOwnEnumerableProperty(ref, key)) {
                return false;
            }
        }
    }

    return true;
};


class SeenEntry {
    obj: unknown;
    ref: unknown;

    constructor(obj:unknown, ref:unknown) {

        this.obj = obj;
        this.ref = ref;
    }

    isSame(obj:unknown, ref:unknown) {

        return this.obj === obj && this.ref === ref;
    }
}
