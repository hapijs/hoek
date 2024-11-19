export const prototypes = {

    array: Array.prototype,
    buffer: Buffer.prototype, // $lab:coverage:ignore
    date: Date.prototype,
    error: Error.prototype,
    generic: Object.prototype,
    map: Map.prototype,
    promise: Promise.prototype,
    regex: RegExp.prototype,
    set: Set.prototype,
    url: URL.prototype,
    weakMap: WeakMap.prototype,
    weakSet: WeakSet.prototype
};

export type AnyPrototype = (
    Array<any> |
    Buffer |
    Date |
    Error |
    Map<any, any> |
    Promise<any> |
    RegExp |
    Set<any> |
    URL |
    WeakMap<object, any> |
    WeakSet<object>
)

const typeMap = new Map<string, AnyPrototype>([
    ['[object Error]', prototypes.error],
    ['[object Map]', prototypes.map],
    ['[object Promise]', prototypes.promise],
    ['[object Set]', prototypes.set],
    ['[object URL]', prototypes.url],
    ['[object WeakMap]', prototypes.weakMap],
    ['[object WeakSet]', prototypes.weakSet]
]);

export const getInternalProto = <T>(obj: T) => {

    if (Array.isArray(obj)) {
        return prototypes.array;
    }

    if (Buffer && obj instanceof Buffer) {          // $lab:coverage:ignore$
        return prototypes.buffer;
    }

    if (obj instanceof Date) {
        return prototypes.date;
    }

    if (obj instanceof RegExp) {
        return prototypes.regex;
    }

    if (obj instanceof Error) {
        return prototypes.error;
    }

    const objName = Object.prototype.toString.call(obj);
    return typeMap.get(objName) || prototypes.generic;
};
