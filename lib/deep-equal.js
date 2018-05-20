'use strict';

// Load modules


// Declare internals

const internals = {
    arrayType: Symbol('array'),
    bufferType: Symbol('buffer'),
    dateType: Symbol('date'),
    errorType: Symbol('error'),
    genericType: Symbol('generic'),
    regexType: Symbol('regex'),
    mismatched: Symbol('mismatched')
};


internals.SeenEntry = class {

    constructor(obj, ref) {

        this.obj = obj;
        this.ref = ref;
    }

    isSame(obj, ref) {

        return this.obj === obj && this.ref === ref;
    }
};


internals.getInternalType = function (obj) {

    if (Array.isArray(obj)) {
        return internals.arrayType;
    }
    else if (obj instanceof Date) {
        return internals.dateType;
    }
    else if (obj instanceof Buffer) {
        return internals.bufferType;
    }
    else if (obj instanceof RegExp) {
        return internals.regexType;
    }
    else if (obj instanceof Error) {
        return internals.errorType;
    }

    return internals.genericType;
};


internals.getSharedType = function (obj, ref, checkPrototype) {

    if (checkPrototype) {
        if (Object.getPrototypeOf(obj) !== Object.getPrototypeOf(ref)) {
            return internals.mismatched;
        }

        return internals.getInternalType(obj);
    }

    const type = internals.getInternalType(obj);
    if (type !== internals.getInternalType(ref)) {
        return internals.mismatched;
    }

    return type;
};


internals.valueOf = function (obj) {

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


internals.hasOwnEnumerableProperty = function (obj, key) {

    return Object.prototype.propertyIsEnumerable.call(obj, key);
};


internals.isDeepEqualObj = function (instanceType, obj, ref, options, seen) {

    const { isDeepEqual, valueOf, hasOwnEnumerableProperty } = internals;
    const { keys, getOwnPropertyDescriptor } = Object;

    if (instanceType === internals.arrayType) {
        if (options.part) {
            // Check if any index match any other index

            for (let i = 0; i < obj.length; ++i) {
                const objValue = obj[i];
                for (let j = 0; j < ref.length; ++j) {
                    if (isDeepEqual(objValue, ref[j], options, seen)) {
                        return true;
                    }
                }
            }
        }
        else {
            if (obj.length !== ref.length) {
                return false;
            }

            for (let i = 0; i < obj.length; ++i) {
                if (!isDeepEqual(obj[i], ref[i], options, seen)) {
                    return false;
                }
            }

            return true;
        }
    }
    else if (instanceType === internals.errorType) {
        // Always check name and message

        if (obj.name !== ref.name || obj.message !== ref.message) {
            return false;
        }
    }

    // Check .valueOf()

    const valueOfObj = valueOf(obj);
    const valueOfRef = valueOf(ref);
    if (!(obj === valueOfObj && ref === valueOfRef) &&
        !isDeepEqual(valueOfObj, valueOfRef, options, seen)) {
        return false;
    }

    // Check properties

    const objKeys = keys(obj);
    if (!options.part && objKeys.length !== keys(ref).length) {
        return false;
    }

    for (let i = 0; i < objKeys.length; ++i) {
        const key = objKeys[i];

        const objDescriptor = getOwnPropertyDescriptor(obj, key);
        if (objDescriptor.get) {
            if (!isDeepEqual(objDescriptor, getOwnPropertyDescriptor(ref, key), options, seen)) {
                return false;
            }
        }
        else if (!hasOwnEnumerableProperty(ref, key) || !isDeepEqual(obj[key], ref[key], options, seen)) {
            return false;
        }
    }

    return true;
};


internals.isDeepEqual = function (obj, ref, options, seen) {

    if (obj === ref) {                                      // Copied from Deep-eql, copyright(c) 2013 Jake Luer, jake@alogicalparadox.com, MIT Licensed, https://github.com/chaijs/deep-eql
        return obj !== 0 || 1 / obj === 1 / ref;
    }

    const type = typeof obj;

    if (type !== typeof ref) {
        return false;
    }

    if (type !== 'object' ||
        obj === null ||
        ref === null) {

        return obj !== obj && ref !== ref;                  // NaN
    }

    const instanceType = internals.getSharedType(obj, ref, !!options.prototype);
    switch (instanceType) {
        case internals.bufferType:
            return Buffer.prototype.equals.call(obj, ref);
        case internals.regexType:
            return obj.toString() === ref.toString();
        case internals.mismatched:
            return false;
    }

    for (let i = seen.length - 1; i >= 0; --i) {
        if (seen[i].isSame(obj, ref)) {
            return true;                                    // If previous comparison failed, it would have stopped execution
        }
    }

    seen.push(new internals.SeenEntry(obj, ref));
    try {
        return !!internals.isDeepEqualObj(instanceType, obj, ref, options, seen);
    }
    finally {
        seen.pop();
    }
};


module.exports = function (obj, ref, options) {

    options = options || { prototype: true };

    return !!internals.isDeepEqual(obj, ref, options, []);
};
