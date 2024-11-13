/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string with protection against thrown errors.
 *
 * @param value A JavaScript value, usually an object or array, to be converted.
 * @param replacer The JSON.stringify() `replacer` argument.
 * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 *
 * @return The JSON string. If the operation fails, an error string value is returned (no exception thrown).
 */
export const stringify = (value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string => {

    try {
        return JSON.stringify(value,replacer,space);
    }
    catch (err) {
        return '[Cannot display object: ' + err.message + ']';
    }
};
