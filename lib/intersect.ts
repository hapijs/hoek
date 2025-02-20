export type IntersectArray<T> = Array<T> | Set<T> | Record<number, T> | null


export interface IntersectOptions {

    /**
     * When true, return the first overlapping value.
     *
     * @default false
     */
    readonly first?: boolean;
}

interface intersect {
    <T1 extends IntersectArray<any>, T2 extends IntersectArray<any>> (
        array1: T1,
        array2: T2
    ): T1 | T2 | null;
    <T1, T2> (
        array1: IntersectArray<T1>,
        array2: IntersectArray<T2>,
        options: { first: true }
    ): T1 | T2 | null;
}

export function intersect<T1 extends IntersectArray<any>, T2 extends IntersectArray<any>>(
    array1: T1,
    array2: T2,
    options: IntersectOptions = {}
) {

    if (!array1 || !array2) {

        return (options.first ? null : []);
    }

    const common = [];
    const hash = (Array.isArray(array1) ? new Set(array1) : array1);
    const found = new Set();

    for (const value of (array2 as Iterable<T2>)) {

        if (
            has(hash, value as never) &&
            !found.has(value)
        ) {

            if (options.first) {
                return value;
            }

            common.push(value);
            found.add(value);
        }
    }

    return (options.first ? null : common);
};


const has = function (ref: NonNullable<IntersectArray<any>>, key: string) {

    const asSet = ref as Set<any>;
    const asArray = ref as Array<any>;

    if (typeof asSet.has === 'function') {
        return asSet.has(key);
    }

    return asArray[key as any] !== undefined;
};
