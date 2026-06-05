import 'vitest';

declare module 'vitest' {
    interface Assertion<T = any> {
        toHoequal(expected: T, options?: any): T;
    }
}
