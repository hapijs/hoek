import { expect } from 'vitest';

import { deepEqual, type DeepEqualOptions } from './src/deepEqual.ts';

// Custom matcher backed by hoek's own deepEqual — the same engine @hapi/code.equal()
// wrapped, minus the dependency. Defaults mirror code.equal(): prototype comparison off,
// deep function comparison on. Tests opt into prototype/symbol checks via the options arg.
expect.extend({
    toHoequal(received: unknown, expected: unknown, options?: DeepEqualOptions) {
        const pass = deepEqual(received, expected, { prototype: false, deepFunction: true, ...options });

        return {
            pass,
            message: () => `Expected values ${pass ? 'not ' : ''}to be deeply equal`,
            actual: received,
            expected,
        };
    },
});
