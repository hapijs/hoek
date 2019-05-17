// Adapted from https://github.com/DefinitelyTyped, MIT Licensed
// Originally by Prashant Tiwari <https://github.com/prashaantt>

export interface CloneOptions {
    /** Clone symbol properties. */
    symbols?: boolean;
}

export interface DeepEqualOptions {
    /** Compare object prototypes */
    prototype?: boolean;
    /** Compare symbol properties. */
    symbols?: boolean;
}

export interface ContainOptions {
    /** Perform a deep comparison of the values? */
    deep?: boolean;
    /** Allow only one occurrence of each value? */
    once?: boolean;
    /** Don't allow values not explicitly listed? */
    only?: boolean;
    /** Allow partial match of the values? */
    part?: boolean;
}

export interface BaseReachOptions {
    /** Value to return if the path or value is not present. Default is undefined. */
    default?: any;
    /** Throw an error on missing member? Default is false. */
    strict?: boolean;
    /** Allow traversing functions for properties? */
    functions?: boolean;
}

export interface FullReachOptions extends BaseReachOptions {
    /** String to split chain path on. Defaults to ".". */
    separator?: string;
}

// Type aliases

type ObjectProperty = string | number | symbol;

// Object

/**
 * Clone an object or an array.
 */
export function clone<T>(obj: T, options?: CloneOptions): T;

/**
 * Clone an object or array.
 */
export function cloneWithShallow<T>(obj: T, keys: (string | ObjectProperty[])[], options?: CloneOptions): T;

/**
 * Merge all the properties of source into target.
 */
export function merge<T extends object, S extends object>(target: T, source: S, isNullOverride?: boolean, isMergeArrays?: boolean): T & S;
export function merge<T extends object, S extends object>(target: T, source: null | undefined, isNullOverride?: boolean, isMergeArrays?: boolean): T;

/**
 * Apply options to a copy of the defaults.
 */
export function applyToDefaults<T1 extends object, T2 extends object>(defaults: T1, options: T2, isNullOverride?: boolean): T1 & T2;

/**
 * Apply options to a copy of the defaults.
 */
export function applyToDefaultsWithShallow<T1 extends object, T2 extends object>(defaults: T1, options: T2, keys: (string | ObjectProperty[])[]): T1 & T2;

/**
 * Perform a deep comparison of the two values.
 */
export function deepEqual<T>(b: T, a: T, options?: DeepEqualOptions): boolean;

/**
 * Find the common unique items in two arrays.
 */
export function intersect<T>(array1: Iterable<T>, array2: Iterable<T>): T[];

/**
 * Test if the reference value contains the provided values.
 */
export function contain(ref: string, values: string | string[], options?: ContainOptions): boolean;
export function contain<T>(ref: T[], values: T | T[], options?: ContainOptions): boolean;
export function contain(ref: object, values: ObjectProperty | ObjectProperty[], options?: ContainOptions): boolean;
export function contain(ref: object, values: object, options?: ContainOptions): boolean;

/**
 * Flatten an array.
 */
export function flatten(array: any[], target?: any[]): any[];

/**
 * Convert an object key chain string to reference.
 */
export function reach(obj: object | Function, chain: string, options?: FullReachOptions): any;
export function reach(obj: object | Function, chain: ObjectProperty[], options?: BaseReachOptions): any;

/**
 * Replace string parameters ({name}) with their corresponding object key values.
 */
export function reachTemplate(obj: object | Function, template: string, options?: FullReachOptions): any;

/**
 * Convert an object to string. Any errors are caught and reported back in the form of the returned string.
 */
export function stringify(obj: any): string;

// Bench

/**
 * Same as Timer, except ts stores the internal node clock.
 */
export class Bench {
    /** The number of milliseconds on the node clock elapsed since the epoch. */
    ts: number;
    /** The time (ms) elapsed since the timer was created. */
    elapsed(): number;
    /** Reset epoch to now. */
    reset(): void;
}

// Escaping Characters

/**
 * Escape html characters.
 */
export function escapeHtml(htmlString: string): string;

/**
 * Escape attribute value for use in HTTP header.
 */
export function escapeHeaderAttribute(attribute: string): string;

/**
 * Escape string for Regex construction.
 */
export function escapeRegex(regexString: string): string;

// Errors

/**
 * Print message or throw error if condition fails.
 */
export function assert(condition: any, message: string | Error): void | never;

// Function

/**
 * Make sure fn is only run once.
 */
export function once<T extends (...args: any) => any>(fn: T): T | ((...args: Parameters<T>) => void);

/**
 * A simple no-op function.
 */
export function ignore(...args: any): void;

// Miscellaneous

/**
 * path to prepend to a randomly generated file name.
 */
export function uniqueFilename(path: string, extension?: string): string;

// Promises

/**
 * Resolve the promise after `timeout`. Provide the `timeout` in milliseconds.
 */
export function wait(timeout: number): Promise<void>;

/**
 * A no-op Promise. Does nothing.
 */
export function block(): Promise<never>;
