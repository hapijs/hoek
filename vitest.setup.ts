import Code from '@hapi/code';
import { expect } from 'vitest';

// Extend vitest's expect with a custom matcher that uses @hapi/code's equality testing
// This is needed because vitest's toEqual doesn't handle prototype testing correctly
expect.extend({
    toHoequal(received: any, expected: any, options?: any) {
        try {
            Code.expect(received).to.equal(expected, options);
            return {
                pass: true,
                message: () => `Expected values not to be deeply equal`,
                actual: received,
                expected,
            };
        } catch {
            return {
                pass: false,
                message: () => `Expected values to be deeply equal`,
                actual: received,
                expected,
            };
        }
    },
});
