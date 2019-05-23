'use strict';

const internals = {};


exports = module.exports = {
    array: Array.prototype,
    buffer: Buffer.prototype,
    date: Date.prototype,
    error: Error.prototype,
    generic: Object.prototype,
    map: Map.prototype,
    promise: Promise.prototype,
    regex: RegExp.prototype,
    set: Set.prototype,
    weakMap: WeakMap.prototype,
    weakSet: WeakSet.prototype
};


internals.typeMap = new Map([
    ['[object Array]', exports.array],
    ['[object Date]', exports.date],
    ['[object Error]', exports.error],
    ['[object Map]', exports.map],
    ['[object Promise]', exports.promise],
    ['[object RegExp]', exports.regex],
    ['[object Set]', exports.set],
    ['[object WeakMap]', exports.weakMap],
    ['[object WeakSet]', exports.weakSet]
]);


exports.getInternalProto = function (obj) {

    const { typeMap } = internals;
    const { buffer, generic } = exports;

    if (obj instanceof Buffer) {
        return buffer;
    }

    const objName = Object.prototype.toString.call(obj);
    return typeMap.get(objName) || generic;
};
