import { describe, it, expect } from 'vitest';

import * as Hoek from '../src/index.js';

describe('index', () => {
    it('exports the expected keys', () => {
        expect(Object.keys(Hoek).sort()).toMatchInlineSnapshot(`
          [
            "AssertError",
            "Bench",
            "applyToDefaults",
            "assert",
            "block",
            "clone",
            "contain",
            "deepEqual",
            "escapeHeaderAttribute",
            "escapeHtml",
            "escapeJson",
            "escapeRegex",
            "flatten",
            "ignore",
            "intersect",
            "isPromise",
            "merge",
            "once",
            "reach",
            "reachTemplate",
            "stringify",
            "wait",
          ]
        `);
    });
});
