export const keys = <T extends object>(obj: T, options: { symbols?: boolean | undefined } = {}) => {

    // Defaults to true
    const res = options.symbols !== false
        ? Reflect.ownKeys(obj)
        : Object.getOwnPropertyNames(obj);


    return res as (keyof T)[];
};
