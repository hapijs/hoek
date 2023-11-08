import 'vitest';

import type { DeepEqualOptions } from './src/deepEqual.js';

declare module 'vitest' {
    interface Assertion<T = any> {
        toHoequal(expected: T, options?: DeepEqualOptions): T;
    }
}
