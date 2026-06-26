import 'vitest';

import type { DeepEqualOptions } from './src/deepEqual.ts';

declare module 'vitest' {
    interface Assertion<T = any> {
        toHoequal(expected: T, options?: DeepEqualOptions): T;
    }
}
