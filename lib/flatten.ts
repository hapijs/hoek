export const flatten = <T>(array: Array<T>): FlatArray<T, typeof Infinity>[] => {

    return array.flat(Infinity);
};
