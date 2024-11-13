export const    array = Array.prototype;
export const    buffer = Buffer && Buffer.prototype;             // $lab:coverage:ignore$
export const    date = Date.prototype;
export const    error = Error.prototype;
export const    generic = Object.prototype;
export const    map = Map.prototype;
export const    promise = Promise.prototype;
export const    regex = RegExp.prototype;
export const    set = Set.prototype;
export const url = URL.prototype;
export const    weakMap = WeakMap.prototype;
export const    weakSet = WeakSet.prototype;


const typeMap = new Map([
    ['[object Error]', exports.error],
    ['[object Map]', exports.map],
    ['[object Promise]', exports.promise],
    ['[object Set]', exports.set],
    ['[object URL]', exports.url],
    ['[object WeakMap]', exports.weakMap],
    ['[object WeakSet]', exports.weakSet]
]);


export const getInternalProto = <T extends object>(obj: T): T => {

    if (Array.isArray(obj)) {
        return exports.array;
    }

    if (Buffer && obj instanceof Buffer) {          // $lab:coverage:ignore$
        return exports.buffer;
    }

    if (obj instanceof Date) {
        return exports.date;
    }

    if (obj instanceof RegExp) {
        return exports.regex;
    }

    if (obj instanceof Error) {
        return exports.error;
    }

    const objName = Object.prototype.toString.call(obj);
    return typeMap.get(objName) || exports.generic;
};
