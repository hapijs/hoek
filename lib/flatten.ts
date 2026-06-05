type FlattenArray<T> = T extends [infer U, ...infer V]
    ? [U] extends [Array<any>]
        ? [...FlattenArray<U>, ...FlattenArray<V>]
        : [U, ...FlattenArray<V>]
    : T;

export const flatten = <T>(array: Array<T>): FlattenArray<Array<T>> => {
    return array.flat(Infinity) as FlattenArray<Array<T>>;
};
