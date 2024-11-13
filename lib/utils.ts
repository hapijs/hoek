export const keys = (obj: object, options: { symbols?:boolean } = {}) => {

    return options.symbols !== false ? Reflect.ownKeys(obj) : Object.getOwnPropertyNames(obj);  // Defaults to true
};
