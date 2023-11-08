type Flattened<T> = T extends readonly (infer U)[] ? Flattened<U> : T;

/**
 * Flatten an array with any level of nested arrays.
 *
 * @param array - The array of items or other arrays to flatten.
 * @param target - If provided, an array to shallow copy the flattened `array` items to.
 * @returns A flat array of the provided values, appended to `target` if provided. Note that `target` items are copied
 *   as-is and are never flattened.
 */
export const flatten = <T, U = never>(array: Array<T>, target?: Array<U>): (Flattened<T> | U)[] => {
    const result = (target || []) as unknown[];

    for (const entry of array) {
        if (Array.isArray(entry)) {
            flatten(entry, result);
        } else {
            result.push(entry);
        }
    }

    return result as (Flattened<T> | U)[];
};
