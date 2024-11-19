import { reach } from './reach';
import { prototypes, getInternalProto } from './types';
import * as Utils from './utils';

const internals = {
    needsProtoHack: new Set([
        prototypes.set,
        prototypes.map,
        prototypes.weakSet,
        prototypes.weakMap
    ])
};

type ObjKey = string | symbol | number;
export type ShallowKeys = ObjKey[] | ObjKey[][];

export interface CloneOptions {

    /**
     * Clone the object's prototype.
     *
     * @default true
     */
    prototype?: boolean;

    /**
     * Include symbol properties.
     *
     * @default true
     */
    symbols?: boolean;

    /**
     * Shallow clone the specified keys.
     *
     * @default undefined
     */
    shallow?: ShallowKeys | boolean;
}


export const clone = function <T> (
    obj: T,
    options: CloneOptions = {},
    _seen: Map<unknown, unknown> | null = null
): T {

    if (typeof obj !== 'object' ||
        obj === null) {

        return obj;
    }

    let cloneFn = clone;
    let seen = _seen;

    if (options.shallow) {

        if (options.shallow !== true) {

            return cloneWithShallow(obj, options);
        }

        cloneFn = (value) => value;
    }
    else if (seen) {

        const lookup = seen.get(obj);

        if (lookup) {

            return lookup as T;
        }
    }
    else {

        seen = new Map();
    }

    // Built-in object types

    if (Buffer && Buffer.isBuffer(obj)) {
        return Buffer.from(obj) as T;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as T;
    }

    if (obj instanceof RegExp) {
        return new RegExp(obj) as T;
    }

    if (obj instanceof URL) {
        return new URL(obj) as T;
    }

    const baseProto = getInternalProto(obj);

    // Generic objects

    const newObj = base(obj, baseProto, options);
    if (newObj === obj) {
        return obj;
    }

    if (seen) {
        seen.set(obj, newObj);                              // Set seen, since obj could recurse
    }

    if (baseProto as never === prototypes.set) {
        for (const value of obj as never[]) {
            (newObj as unknown as Set<any>).add(cloneFn(value, options, seen));
        }
    }
    else if (baseProto as never  === prototypes.map) {
        for (
            const [key, value] of
            obj as unknown as Map<unknown, unknown>
        ) {
            (newObj as unknown as Map<any, any>).set(key, cloneFn(value, options, seen));
        }
    }

    const keys = Utils.keys(obj, options);
    for (const key of keys) {
        if (key === '__proto__') {
            continue;
        }

        if (baseProto === prototypes.array &&
            key === 'length') {

            (newObj as []).length = (obj as []).length;
            continue;
        }

        if (
            (baseProto as unknown as Error) === prototypes.error &&
            key === 'stack'
        ) {

            continue;       // Already a part of the base object
        }

        const descriptor = Object.getOwnPropertyDescriptor(obj, key);
        if (descriptor) {
            if (descriptor.get ||
                descriptor.set) {

                Object.defineProperty(newObj, key, descriptor);
            }
            else if (descriptor.enumerable) {
                newObj[key] = cloneFn(obj[key], options, seen);
            }
            else {
                Object.defineProperty(newObj, key, { enumerable: false, writable: true, configurable: true, value: cloneFn(obj[key], options, seen) });
            }
        }
        else {
            Object.defineProperty(newObj, key, {
                enumerable: true,
                writable: true,
                configurable: true,
                value: cloneFn(obj[key], options, seen)
            });
        }
    }

    return newObj;
};


const cloneWithShallow = function <T extends object> (source: T, options: CloneOptions) {

    const keys = options.shallow as string[] | string[][];
    options = Object.assign({}, options) as CloneOptions;
    options.shallow = false;

    const seen = new Map();

    for (const key of keys) {
        const ref = reach(source, key);
        if (typeof ref === 'object' ||
            typeof ref === 'function') {

            seen.set(ref, ref);
        }
    }

    return clone(source, options, seen);
};


const base = function <T> (obj: T, baseProto: any, options: CloneOptions): T {

    if (options.prototype === false) {                  // Defaults to true
        if (internals.needsProtoHack.has(baseProto)) {
            return new baseProto.constructor();
        }

        return baseProto === prototypes.array ? [] as T : {} as T;
    }

    const proto = Object.getPrototypeOf(obj);
    if (proto &&
        proto.isImmutable) {

        return obj;
    }

    if (baseProto === prototypes.array) {

        const newObj = [] as unknown as T;

        if (proto !== baseProto) {
            Object.setPrototypeOf(newObj, proto);
        }

        return newObj;
    }
    else if (baseProto === prototypes.error) {

        const err = structuredClone(obj); // Needed to copy internal stack state

        if (Object.getPrototypeOf(err) !== proto) {
            Object.setPrototypeOf(err, proto); // Fix prototype
        }

        return err;
    }

    if (internals.needsProtoHack.has(baseProto)) {

        const newObj = new proto.constructor();

        if (proto !== baseProto) {
            Object.setPrototypeOf(newObj, proto);
        }

        return newObj;
    }

    return Object.create(proto);
};
