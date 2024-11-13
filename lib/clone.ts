import { reach } from './reach';
import * as Types from './types';
import * as Utils from './utils';

const internals = {
    needsProtoHack: new Set([Types.set, Types.map, Types.weakSet, Types.weakMap])
};

export     interface CloneOptions {

    /**
     * Clone the object's prototype.
     *
     * @default true
     */
    readonly prototype?: boolean;

    /**
     * Include symbol properties.
     *
     * @default true
     */
    readonly symbols?: boolean;

    /**
     * Shallow clone the specified keys.
     *
     * @default undefined
     */
    readonly shallow?: string[] | string[][] | boolean;
}


export const clone = function <T> (obj: T, options:CloneOptions = {}, _seen: Map<any, any> | null = null): T {

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
            return lookup;
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

    const baseProto = Types.getInternalProto(obj);

    // Generic objects

    const newObj = base(obj, baseProto, options);
    if (newObj === obj) {
        return obj;
    }

    if (seen) {
        seen.set(obj, newObj);                              // Set seen, since obj could recurse
    }

    if (baseProto === Types.set) {
        for (const value of obj) {
            newObj.add(cloneFn(value, options, seen));
        }
    }
    else if (baseProto === Types.map) {
        for (const [key, value] of obj) {
            newObj.set(key, cloneFn(value, options, seen));
        }
    }

    const keys = Utils.keys(obj, options);
    for (const key of keys) {
        if (key === '__proto__') {
            continue;
        }

        if (baseProto === Types.array &&
            key === 'length') {

            newObj.length = obj.length;
            continue;
        }

        if (baseProto === Types.error &&
            key === 'stack') {

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


const cloneWithShallow = function (source, options) {

    const keys = options.shallow;
    options = Object.assign({}, options);
    options.shallow = false;

    const seen = new Map();

    for (const key of keys) {
        const ref = reach(source, key);
        if (typeof ref === 'object' ||
            typeof ref === 'function') {

            seen.set(ref, ref);
        }
    }

    return internals.clone(source, options, seen);
};


const base = function (obj, baseProto, options) {

    if (options.prototype === false) {                  // Defaults to true
        if (internals.needsProtoHack.has(baseProto)) {
            return new baseProto.constructor();
        }

        return baseProto === Types.array ? [] : {};
    }

    const proto = Object.getPrototypeOf(obj);
    if (proto &&
        proto.isImmutable) {

        return obj;
    }

    if (baseProto === Types.array) {
        const newObj = [];
        if (proto !== baseProto) {
            Object.setPrototypeOf(newObj, proto);
        }

        return newObj;
    }
    else if (baseProto === Types.error) {
        const err = structuredClone(obj);                    // Needed to copy internal stack state
        if (Object.getPrototypeOf(err) !== proto) {
            Object.setPrototypeOf(err, proto);               // Fix prototype
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
