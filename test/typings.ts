import { describe, expectTypeOf, it } from 'vitest';

import * as Hoek from '../src/index.js';

interface Foo {
    a?: number;
    b?: string;
}

interface Bar {
    b?: string;
    c?: boolean;
}

describe('typings', () => {
    it('exposes functions directly', () => {
        expectTypeOf(Hoek.deepEqual).toBeFunction();
        expectTypeOf(Hoek.deepEqual(1, 2)).toBeBoolean();
    });

    describe('deepEqual()', () => {
        it('accepts valid calls', () => {
            Hoek.deepEqual('some', 'some');
            Hoek.deepEqual('some', 3);
            Hoek.deepEqual({}, {});
            Hoek.deepEqual({}, {}, { prototype: false, symbols: true, part: false, deepFunction: true });
            Hoek.deepEqual({}, {}, { skip: ['a', 'b', Symbol('test')] });

            expectTypeOf(Hoek.deepEqual(1, 2)).toBeBoolean();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error requires two arguments
                Hoek.deepEqual();
                // @ts-expect-error too many arguments
                Hoek.deepEqual(1, 2, {}, 'x');
                // @ts-expect-error unknown option
                Hoek.deepEqual({}, {}, { unknown: true });
                // @ts-expect-error skip must be string/symbol keys
                Hoek.deepEqual({}, {}, { skip: [1] });
            } catch {}
        });
    });

    describe('clone()', () => {
        it('accepts valid calls', () => {
            Hoek.clone('string');
            Hoek.clone(123);
            Hoek.clone({ a: 1 });
            Hoek.clone({ a: 1 }, { prototype: true, symbols: true });
            Hoek.clone({}, { shallow: [] });
            Hoek.clone(1, { shallow: [] });
            Hoek.clone(null, { shallow: [] });
            Hoek.clone({ a: 1, b: { c: [2] } }, { shallow: true });
            Hoek.clone({ a: 1, b: { c: [2] } }, { shallow: ['b'] });
            Hoek.clone({ a: 1, b: { c: [2] } }, { shallow: [['b']] });
            Hoek.clone({ a: 1, b: { c: [2] } }, { shallow: ['b'], prototype: true, symbols: true });

            expectTypeOf(Hoek.clone('string')).toBeString();
            expectTypeOf(Hoek.clone({})).toBeObject();
            expectTypeOf(Hoek.clone({} as Bar)).toEqualTypeOf<Bar>();
            expectTypeOf(Hoek.clone({ a: 1 } as Foo, { shallow: ['b'] })).toEqualTypeOf<Foo>();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error unknown option
                Hoek.clone({}, { unknown: true });
                // @ts-expect-error shallow entries must be paths
                Hoek.clone({}, { shallow: [null] });
                // @ts-expect-error shallow must be an array or boolean
                Hoek.clone({}, { shallow: 1 });
            } catch {}
        });
    });

    describe('merge()', () => {
        it('accepts valid calls', () => {
            Hoek.merge({ a: 1 } as Foo, { b: 'x' } as Bar);
            Hoek.merge({ a: 1 }, { a: null });
            Hoek.merge({ a: 1 }, { a: null }, { mergeArrays: true, nullOverride: true, symbols: false });

            expectTypeOf(Hoek.merge({}, {})).toBeObject();
            expectTypeOf(Hoek.merge({ a: 1 } as Foo, { b: 'x' } as Bar)).toEqualTypeOf<Foo & Bar>();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error cannot merge non-object
                Hoek.merge(1, 2);
                // @ts-expect-error options must be an object
                Hoek.merge({ a: 1 }, { a: null }, true);
                // @ts-expect-error unknown option
                Hoek.merge({ a: 1 }, { a: null }, { unknown: true });
            } catch {}
        });
    });

    describe('applyToDefaults()', () => {
        it('accepts valid calls', () => {
            Hoek.applyToDefaults({}, {});
            Hoek.applyToDefaults({}, true);
            Hoek.applyToDefaults({}, false);
            Hoek.applyToDefaults({}, null);
            Hoek.applyToDefaults({ a: 1 } as Foo, { b: 'x' });
            Hoek.applyToDefaults({ a: 1 } as object, { b: 'x' });
            Hoek.applyToDefaults({ a: 1 } as Foo, { b: 'x' }, { shallow: ['b'] });
            Hoek.applyToDefaults({ a: 1 } as object, { b: 'x' }, { shallow: ['c'] });

            expectTypeOf(Hoek.applyToDefaults({}, {})!).toBeObject();
            expectTypeOf(Hoek.applyToDefaults({ a: 1 } as Foo, { b: 'x' })!).toBeObject();
            expectTypeOf(Hoek.applyToDefaults({}, {}, { shallow: [] })!).toBeObject();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error source must be an object, falsy, or true
                Hoek.applyToDefaults({} as Foo, 'zzz');
                // @ts-expect-error unknown option
                Hoek.applyToDefaults({}, {}, { unknown: true });
            } catch {}
        });
    });

    describe('intersect()', () => {
        it('accepts valid calls', () => {
            Hoek.intersect([1], [1, 2]);
            Hoek.intersect(['a'], ['b', 'b']);
            Hoek.intersect([1], [1, 2], { first: true });
            Hoek.intersect([1], [1, 2], { first: false });
            Hoek.intersect([1], null);
            Hoek.intersect(null, [1, 2]);
            Hoek.intersect([1], null, { first: true });
            Hoek.intersect(null, [1, 2], { first: true });
            Hoek.intersect(new Set([1]), new Set([1, 2]));
            Hoek.intersect([1], new Set([1, 2]));
            Hoek.intersect(new Set([1]), [1, 2]);

            expectTypeOf(Hoek.intersect([1], [1, 2])).toEqualTypeOf<number[] | null>();
            expectTypeOf(Hoek.intersect([1], [1, 2], { first: false })).toEqualTypeOf<number[] | null>();
            expectTypeOf(Hoek.intersect([1], [1, 2], { first: true })).toEqualTypeOf<number | null>();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error requires two arguments
                Hoek.intersect();
                // @ts-expect-error arguments must be arrays or sets
                Hoek.intersect(1, 2);
                // @ts-expect-error second argument must be an array or set
                Hoek.intersect([1], 2);
                // @ts-expect-error options must be an object
                Hoek.intersect([1], [2], 'x');
                // @ts-expect-error maps are not supported
                Hoek.intersect(new Map(), [2]);
            } catch {}
        });
    });

    describe('contain()', () => {
        it('accepts valid calls', () => {
            Hoek.contain('abc', 'a');
            Hoek.contain('abc', ['a', 'x']);
            Hoek.contain('abc', ['a', 'd'], { once: true, part: true, deep: true, symbols: true, only: true });
            Hoek.contain({ a: 1 }, 'a');
            Hoek.contain({ a: 1 }, { a: 1 });
            Hoek.contain({ a: 1, b: 2 }, ['a', 'b'], { part: true, deep: true, symbols: true, only: true });
            Hoek.contain([1], 1);
            Hoek.contain([1], [1]);
            Hoek.contain([1], [1], { once: true, part: true, deep: true, symbols: true, only: true });

            expectTypeOf(Hoek.contain('abc', 'a')).toBeBoolean();
            expectTypeOf(Hoek.contain({ a: 1 }, 'a')).toBeBoolean();
            expectTypeOf(Hoek.contain([1], 1)).toBeBoolean();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error unknown option
                Hoek.contain('abc', 'a', { unknown: true });
                // @ts-expect-error unknown option
                Hoek.contain(['a'], 'a', { unknown: true });
                // @ts-expect-error unknown option
                Hoek.contain({ a: 1 }, 'a', { unknown: true });
                // @ts-expect-error string haystack needs string values
                Hoek.contain('abc', [{}]);
                // @ts-expect-error string haystack needs string values
                Hoek.contain('abc', {});
                // @ts-expect-error value must be a known key of the object
                Hoek.contain({ a: 1, b: 2 }, ['a', 'x']);
            } catch {}
        });
    });

    describe('flatten()', () => {
        it('accepts valid calls', () => {
            Hoek.flatten([1, [2, 3]]);
            Hoek.flatten([1, [2, 3]], [4, [5]]);

            expectTypeOf(Hoek.flatten([1, [2, 3]])).toBeArray();
            expectTypeOf(Hoek.flatten([1, [2, [3, [4]]]])).toEqualTypeOf<number[]>();
            expectTypeOf(Hoek.flatten([1, ['a']])).toEqualTypeOf<(number | string)[]>();
            expectTypeOf(Hoek.flatten([1, [2]], [3, [4]])).toEqualTypeOf<(number | number[])[]>();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error requires an array
                Hoek.flatten();
                // @ts-expect-error argument must be an array
                Hoek.flatten(1);
                // @ts-expect-error target must be an array
                Hoek.flatten([], 1);
            } catch {}
        });
    });

    describe('reach()', () => {
        it('accepts valid calls', () => {
            Hoek.reach([]);
            Hoek.reach(null, false);
            Hoek.reach(null, '0');
            Hoek.reach(null, ['0']);
            Hoek.reach(['abc'], false);
            Hoek.reach(['abc'], null);
            Hoek.reach(['abc'], undefined);
            Hoek.reach(['abc'], [0]);
            Hoek.reach(['abc'], ['0']);
            Hoek.reach(['abc'], '0');
            Hoek.reach({ a: { b: { c: 3 } } }, 'a.b.c');
            Hoek.reach({ a: { b: { c: 3 } } }, ['a', 'b', 'c']);
            Hoek.reach({ a: { b: { c: 3 } } }, 'a/b/c', {
                separator: '/',
                default: 4,
                strict: true,
                functions: true,
                iterables: true,
            });

            expectTypeOf(Hoek.reach(['abc'], [0])).toBeUnknown();
            expectTypeOf(Hoek.reach({ a: { b: { c: 3 } } }, 'a.b.c')).toBeUnknown();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error requires an object or null
                Hoek.reach();
                // @ts-expect-error obj must be an object or null
                Hoek.reach(1, '0');
                // @ts-expect-error obj must be an object or null
                Hoek.reach('abc', '0');
                // @ts-expect-error chain must be a string/array/null/false
                Hoek.reach([0], 0);
                // @ts-expect-error unknown option
                Hoek.reach(['abc'], '0', { unknown: false });
                // @ts-expect-error separator must be a string
                Hoek.reach(['abc'], '0', { separator: false });
            } catch {}
        });
    });

    describe('reachTemplate()', () => {
        it('accepts valid calls', () => {
            Hoek.reachTemplate(null, 'a{b}c');
            Hoek.reachTemplate([1, 2], 'a{1}c');
            Hoek.reachTemplate({ b: 2 }, 'a{b}c');
            Hoek.reachTemplate({ a: { b: { c: 3 } } }, '{a/b/c}', {
                separator: '/',
                default: 4,
                strict: true,
                functions: true,
            });

            expectTypeOf(Hoek.reachTemplate([1, 2], 'a{1}c')).toBeString();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error requires a template
                Hoek.reachTemplate();
                // @ts-expect-error requires a template
                Hoek.reachTemplate([]);
                // @ts-expect-error obj must be an object or null
                Hoek.reachTemplate(1, '0');
                // @ts-expect-error obj must be an object or null
                Hoek.reachTemplate('abc', '0');
                // @ts-expect-error template must be a string
                Hoek.reachTemplate([0], 0);
                // @ts-expect-error unknown option
                Hoek.reachTemplate(['abc'], '{0}', { unknown: false });
                // @ts-expect-error separator must be a string
                Hoek.reachTemplate(['abc'], '{0}', { separator: false });
            } catch {}
        });
    });

    describe('assert()', () => {
        it('accepts valid calls', () => {
            Hoek.assert(true);
            Hoek.assert(true, 'some', 'message', 10);
            Hoek.assert(1, 'error');
            Hoek.assert(true, new Error('message'));

            expectTypeOf(Hoek.assert(true)).toBeVoid();
        });
    });

    describe('Bench', () => {
        const bench = new Hoek.Bench();

        it('exposes instance and static members', () => {
            expectTypeOf(bench.ts).toBeNumber();
            expectTypeOf(bench.reset()).toBeVoid();
            expectTypeOf(bench.elapsed()).toBeNumber();
            expectTypeOf(Hoek.Bench.now()).toBeNumber();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error constructor takes no arguments
                new Hoek.Bench({});
                // @ts-expect-error reset takes no arguments
                bench.reset(true);
                // @ts-expect-error elapsed takes no arguments
                bench.elapsed(true);
                // @ts-expect-error now takes no arguments
                Hoek.Bench.now(true);
            } catch {}
        });
    });

    describe('escapeRegex()', () => {
        it('accepts valid calls', () => {
            Hoek.escapeRegex('something?');

            expectTypeOf(Hoek.escapeRegex('^?')).toBeString();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error requires a string
                Hoek.escapeRegex();
                // @ts-expect-error argument must be a string
                Hoek.escapeRegex(true);
                // @ts-expect-error argument must be a string
                Hoek.escapeRegex({});
            } catch {}
        });
    });

    describe('escapeHeaderAttribute()', () => {
        it('accepts valid calls', () => {
            Hoek.escapeHeaderAttribute('something?');

            expectTypeOf(Hoek.escapeHeaderAttribute('^?')).toBeString();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error requires a string
                Hoek.escapeHeaderAttribute();
                // @ts-expect-error argument must be a string
                Hoek.escapeHeaderAttribute(true);
                // @ts-expect-error argument must be a string
                Hoek.escapeHeaderAttribute({});
            } catch {}
        });
    });

    describe('escapeHtml()', () => {
        it('accepts valid calls', () => {
            Hoek.escapeHtml('something?');

            expectTypeOf(Hoek.escapeHtml('^?')).toBeString();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error argument must be a string
                Hoek.escapeHtml(true);
                // @ts-expect-error argument must be a string
                Hoek.escapeHtml({});
            } catch {}
        });
    });

    describe('escapeJson()', () => {
        it('accepts valid calls', () => {
            Hoek.escapeJson('something?');

            expectTypeOf(Hoek.escapeJson('^?')).toBeString();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error argument must be a string
                Hoek.escapeJson(true);
                // @ts-expect-error argument must be a string
                Hoek.escapeJson({});
            } catch {}
        });
    });

    describe('once()', () => {
        it('accepts valid calls', () => {
            Hoek.once(() => 4);
            Hoek.once(() => undefined);

            expectTypeOf(Hoek.once(() => 'x')).toEqualTypeOf<() => string>();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error requires a function
                Hoek.once();
                // @ts-expect-error argument must be a function
                Hoek.once('x');
                // @ts-expect-error argument must be a function
                Hoek.once({});
            } catch {}
        });
    });

    describe('ignore()', () => {
        it('accepts any arguments', () => {
            Hoek.ignore();
            Hoek.ignore(1, 2, 'x');

            expectTypeOf(Hoek.ignore).toEqualTypeOf<(...args: unknown[]) => void>();
            expectTypeOf(Hoek.ignore()).toBeVoid();
        });
    });

    describe('stringify()', () => {
        it('accepts valid calls', () => {
            Hoek.stringify(123);
            Hoek.stringify({}, null, 4);

            expectTypeOf(Hoek.stringify(123)).toBeString();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error requires a value
                Hoek.stringify();
            } catch {}
        });
    });

    describe('wait()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Hoek.wait(0)).toEqualTypeOf<Promise<void>>();
            expectTypeOf(Hoek.wait(100, 'ok')).toEqualTypeOf<Promise<string>>();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error timeout must be a number/bigint
                Hoek.wait({});
            } catch {}
        });
    });

    describe('block()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Hoek.block()).toEqualTypeOf<Promise<void>>();
            expectTypeOf<Awaited<ReturnType<typeof Hoek.block>>>().toBeVoid();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error takes no arguments
                Hoek.block(123);
            } catch {}
        });
    });

    describe('isPromise()', () => {
        it('accepts valid calls', () => {
            Hoek.isPromise(1);
            Hoek.isPromise({});
            Hoek.isPromise(null);

            expectTypeOf(Hoek.isPromise(1)).toBeBoolean();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error requires an argument
                Hoek.isPromise();
                // @ts-expect-error too many arguments
                Hoek.isPromise(1, 2);
            } catch {}
        });
    });

    describe('AssertError', () => {
        it('exposes the expected shape', () => {
            expectTypeOf(new Hoek.AssertError()).toEqualTypeOf<Hoek.AssertError>();
            expectTypeOf(new Hoek.AssertError('fail')).toEqualTypeOf<Hoek.AssertError>();
            expectTypeOf(new Hoek.AssertError().name).toEqualTypeOf<'AssertError'>();
            expectTypeOf(new Hoek.AssertError().message).toBeString();
        });

        it('rejects invalid calls', () => {
            try {
                // @ts-expect-error message must be a string
                new Hoek.AssertError(new Error());
                // @ts-expect-error takes a single argument
                new Hoek.AssertError('fail', 'again');
            } catch {}
        });
    });
});
