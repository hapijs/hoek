import { describe, it, expect } from 'vitest';

import * as Hoek from '../src/index.js';

const nestedObj = {
    v: [7, 8, 9],
    w: /^something$/gim,
    x: {
        a: [1, 2, 3],
        b: 123456,
        c: new Date(),
        d: /hi/gim,
        e: /hello/,
    },
    y: 'y' as string | number,
    z: new Date(1378775452757),
};

describe('clone()', () => {
    it('clones a nested object', () => {
        const a = nestedObj;
        const b = Hoek.clone(a);

        expect(a).toHoequal(b);
        expect(a.z.getTime()).toEqual(b.z.getTime());
    });

    it('clones a null object', () => {
        const b = Hoek.clone(null);

        expect(b).toBeNull();
    });

    it('should not convert undefined properties to null', () => {
        const obj = { something: undefined };
        const b = Hoek.clone(obj);

        expect(typeof b.something).toEqual('undefined');
    });

    it('should not throw on circular reference', () => {
        const a = {} as any;
        a.x = a;

        expect(() => {
            Hoek.clone(a);
        }).not.toThrow();
    });

    it('clones circular reference', () => {
        type Nested = {
            z: Date;
            y: Nested;
        };

        const x = {
            z: new Date(),
        } as Nested;

        x.y = x;

        const b = Hoek.clone(x);
        expect(Object.keys(b.y)).toEqual(Object.keys(x));
        expect(b.z).not.toBe(x.z);
        expect(b.y).not.toBe(x.y);
        expect(b.y.z).not.toBe(x.y.z);
        expect(b.y).toHoequal(b);
        expect(b.y.y.y.y).toHoequal(b);
    });

    it('clones an object with a null prototype', () => {
        const obj = Object.create(null);
        const b = Hoek.clone(obj);

        expect(b).toHoequal(obj);
    });

    it('clones deeply nested object', () => {
        const a = {
            x: {
                y: {
                    a: [1, 2, 3],
                    b: 123456,
                    c: new Date(),
                    d: /hi/gim,
                    e: /hello/,
                },
            },
        };

        const b = Hoek.clone(a);

        expect(a).toHoequal(b);
        expect(a.x.y.c.getTime()).toEqual(b.x.y.c.getTime());
    });

    it('clones deeply nested set with circular references', () => {
        const s = new Set();
        s.add('a');
        s.add('b');
        s.add(s);

        const a = {
            x: {
                y: {
                    a: s,
                },
            },
        };

        const b = Hoek.clone(a);

        expect(b).toHoequal(a);

        // @ts-expect-error - intentionally testing circular reference
        expect(b).not.toHoequal(new Set(['a', 'b', s]));
        expect(b).not.toBe(a);

        // Verify ordering
        const aIter = a.x.y.a.values();
        for (const value of b.x.y.a.values()) {
            expect(value).toHoequal(aIter.next().value);
        }
    });

    it('shallow clones set', () => {
        const set = new Set();
        set.add('a');
        set.add('b');
        set.add(set);

        const clone = Hoek.clone(set, { shallow: true });

        expect(clone).toHoequal(set);
        expect(clone.has(set)).toBe(true);
    });

    it('clones deeply nested map with circular references', () => {
        const m = new Map();
        m.set('a', 'a');
        m.set('b', 'b');
        m.set('c', m);

        const a = {
            x: {
                y: {
                    a: m,
                },
            },
        };

        const b = Hoek.clone(a);

        // Verify key ordering

        const aIter = a.x.y.a.keys();
        for (const key of b.x.y.a.keys()) {
            expect(key).toHoequal(aIter.next().value);
        }
    });

    it('shallow clones map', () => {
        const map = new Map();
        map.set('a', { x: 1 });
        map.set(map, map);

        const clone = Hoek.clone(map, { shallow: true });

        expect(clone).toHoequal(map);
        expect(clone.has(map)).toBe(true);
        expect(clone.get('a')).toBe(map.get('a'));
    });

    it('clones arrays', () => {
        const a = [1, 2, 3];

        const b = Hoek.clone(a);

        expect(a).toHoequal(b);
    });

    it('clones holey arrays', () => {
        const a = new Array(3);
        a[1] = 'one';

        const b = Hoek.clone(a);

        expect(a).toHoequal(b);
    });

    it('clones array-based class', () => {
        const A = class extends Array {
            __x = 1;

            __y() {
                return 2;
            }
        };

        const a = new A(1);

        const b = Hoek.clone(a);

        expect(a).toHoequal(b);
        expect(b.__x).toEqual(1);
        expect(b.__y).toBeDefined();
        expect(b.__y()).toEqual(2);
    });

    it('clones array-based class (without prototype)', () => {
        const A = class extends Array {
            __x = 1;

            __y() {
                return 2;
            }
        };

        const a = new A(1);

        const b = Hoek.clone(a, { prototype: false });

        expect(a).toHoequal(b);
        expect(b.__x).toEqual(1);
        expect(b.__y).toBeUndefined();
    });

    it('clones symbol properties', () => {
        const sym1 = Symbol(1);
        const sym2 = Symbol(2);
        const a = { [sym1]: 1 } as { [sym1]: number; [sym2]: number };
        Object.defineProperty(a, sym2, { value: 2 });

        const b = Hoek.clone(a);

        expect(a).toHoequal(b);
        expect(b[sym1]).toEqual(1);
        expect(b[sym2]).toEqual(2);

        expect(Hoek.deepEqual(a, b)).toBe(true);
    });

    it('performs actual copy for shallow keys (no pass by reference)', () => {
        const x = Hoek.clone(nestedObj);
        const y = Hoek.clone(nestedObj);

        // Date
        expect(x.z).not.toBe(nestedObj.z);
        expect(x.z).not.toBe(y.z);

        // Regex
        expect(x.w).not.toBe(nestedObj.w);
        expect(x.w).not.toBe(y.w);

        // Array
        expect(x.v).not.toBe(nestedObj.v);
        expect(x.v).not.toBe(y.v);

        // Immutable(s)
        x.y = 5;

        // @ts-expect-error - intentionally testing immutability
        expect(x.y).not.toHoequal(nestedObj.y);

        // @ts-expect-error - intentionally testing immutability
        expect(x.y).not.toHoequal(y.y);
    });

    it('performs actual copy for deep keys (no pass by reference)', () => {
        const x = Hoek.clone(nestedObj);
        const y = Hoek.clone(nestedObj);

        expect(x.x.c).not.toBe(nestedObj.x.c);
        expect(x.x.c).not.toBe(y.x.c);

        expect(x.x.c.getTime()).toHoequal(nestedObj.x.c.getTime());
        expect(x.x.c.getTime()).toEqual(y.x.c.getTime());
    });

    it('copies functions with properties', () => {
        const a = {
            x: function () {
                return 1;
            },
            y: {},
        } as {
            x: Function & {
                z?: string;
                v?: Function;
            };
            y: {
                u?: any;
            };
        };

        a.x.z = 'string in function';
        a.x.v = function () {
            return 2;
        };

        a.y.u = a.x;

        const b = Hoek.clone(a);
        expect(b.x()).toEqual(1);
        expect(b.x.v!()).toEqual(2);
        expect(b.y.u).toHoequal(b.x);
        expect(b.x.z).toEqual('string in function');
    });

    it('should copy a buffer', () => {
        const tls = {
            key: Buffer.from([1, 2, 3, 4, 5]),
            cert: Buffer.from([1, 2, 3, 4, 5, 6, 10]),
        };

        const copiedTls = Hoek.clone(tls);
        expect(Buffer.isBuffer(copiedTls.key)).toBe(true);
        expect(JSON.stringify(copiedTls.key)).toEqual(JSON.stringify(tls.key));
        expect(Buffer.isBuffer(copiedTls.cert)).toBe(true);
        expect(JSON.stringify(copiedTls.cert)).toEqual(JSON.stringify(tls.cert));

        tls.key.write('hi');
        expect(JSON.stringify(copiedTls.key)).not.toEqual(JSON.stringify(tls.key));
    });

    it('clones an object with a prototype', () => {
        type ObjInst = {
            b: () => 'c';
            a: number;
            x: number;
        };

        interface ObjFn extends ObjInst {
            new (): ObjInst;
        }

        const Obj = function (this: ObjFn) {
            this.a = 5;
        } as unknown as ObjFn;

        Obj.prototype.b = function () {
            return 'c';
        };

        const a = new Obj();
        const b = Hoek.clone(a);

        expect(b.a).toEqual(5);
        expect(b.b()).toEqual('c');
        expect(a).toHoequal(b);
    });

    it('clones an object without a prototype', () => {
        type ObjInst = {
            b: () => 'c';
            a: number;
            x: number;
        };

        interface ObjFn extends ObjInst {
            new (): ObjInst;
        }

        const Obj = function (this: ObjFn) {
            this.a = 5;
        } as unknown as ObjFn;

        Obj.prototype.b = function () {
            return 'c';
        };

        const a = new Obj();
        a.x = 123;

        const b = Hoek.clone(a, { prototype: false });

        expect(a).toHoequal(b);
        expect(a).not.toHoequal(b, { prototype: true });
        expect(b.a).toEqual(5);
        expect(b.b).toBeUndefined();
        expect(b.x).toEqual(123);
    });

    it('reuses cloned Date object', () => {
        const obj = {
            a: new Date(),
        } as {
            a: Date;
            b?: Date;
        };

        obj.b = obj.a;

        const copy = Hoek.clone(obj);
        expect(copy.a).toHoequal(copy.b!);
    });

    it('shallow copies an object with a prototype and isImmutable flag', () => {
        type ObjInst = {
            b: () => 'c';
            value: number;
            x: number;
        };

        interface ObjFn extends ObjInst {
            new (): ObjInst;
        }

        const Obj = function (this: ObjFn) {
            this.value = 5;
        } as unknown as ObjFn;

        Obj.prototype.b = function () {
            return 'c';
        };

        Obj.prototype.isImmutable = true;

        const obj = {
            a: new Obj(),
        };

        const copy = Hoek.clone(obj);

        expect(obj.a.value).toEqual(5);
        expect(copy.a.value).toEqual(5);
        expect(copy.a.b()).toEqual('c');
        expect(obj.a).toHoequal(copy.a);
    });

    it('clones an object with property getter without executing it', () => {
        const obj = {} as { test?: number };
        const value = 1;
        let execCount = 0;

        Object.defineProperty(obj, 'test', {
            enumerable: true,
            configurable: true,
            get: function () {
                ++execCount;
                return value;
            },
        });

        const copy = Hoek.clone(obj);
        expect(execCount).toEqual(0);
        expect(copy.test).toEqual(1);
        expect(execCount).toEqual(1);
    });

    it('clones an object with property getter and setter', () => {
        const obj = {
            _test: 0,
        } as {
            _test: number;
            test?: number;
        };

        Object.defineProperty(obj, 'test', {
            enumerable: true,
            configurable: true,
            get: function () {
                return this._test;
            },
            set: function (value) {
                this._test = value - 1;
            },
        });

        const copy = Hoek.clone(obj);
        expect(copy.test).toEqual(0);
        copy.test = 5;
        expect(copy.test).toEqual(4);
    });

    it('clones an object with only property setter', () => {
        const obj = {
            _test: 0,
        } as {
            _test: number;
            test?: number;
        };

        Object.defineProperty(obj, 'test', {
            enumerable: true,
            configurable: true,
            set: function (value) {
                this._test = value - 1;
            },
        });

        const copy = Hoek.clone(obj);
        expect(copy._test).toEqual(0);
        copy.test = 5;
        expect(copy._test).toEqual(4);
    });

    it('clones an object with non-enumerable properties', () => {
        const obj = {
            _test: 0,
        } as {
            _test: number;
            test?: number;
        };

        Object.defineProperty(obj, 'test', {
            enumerable: false,
            configurable: true,
            set: function (value) {
                this._test = value - 1;
            },
        });

        const copy = Hoek.clone(obj);
        expect(copy._test).toEqual(0);
        copy.test = 5;
        expect(copy._test).toEqual(4);
    });

    it('clones an object where getOwnPropertyDescriptor returns undefined', () => {
        const oldGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
        const obj = { a: 'b' };
        Object.getOwnPropertyDescriptor = function () {
            return undefined;
        };

        const copy = Hoek.clone(obj);
        Object.getOwnPropertyDescriptor = oldGetOwnPropertyDescriptor;
        expect(copy).toHoequal(obj);
    });

    it('clones own property when class property is not writable', () => {
        const Cl = class {
            get x() {
                return 'hi';
            }
        };

        const obj = new Cl();

        Object.defineProperty(obj, 'x', {
            value: 0,
            writable: true,
        });

        const copy = Hoek.clone(obj);
        expect(copy).toHoequal(obj);
    });

    it('clones a Set', () => {
        const a = new Set([1, 2, 3]);
        const b = Hoek.clone(a);

        expect(b).toHoequal(a);
        expect(b).not.toHoequal(new Set([2, 3, 4]));
        expect(b).not.toBe(a);

        // Verify ordering

        const aIter = a.values();
        for (const value of b.values()) {
            expect(value).toHoequal(aIter.next().value!);
        }
    });

    it('clones properties set on a Set', () => {
        const a = new Set([1]) as Set<number> & {
            val: { b: number };
        };

        a.val = { b: 2 };

        const b = Hoek.clone(a);

        expect(b).toHoequal(a);
        expect(b.val).toHoequal(a.val);
        expect(b.val).not.toBe(a.val);
    });

    it('clones subclassed Set', () => {
        const MySet = class extends Set {};

        const a = new MySet([1]);
        const b = Hoek.clone(a);

        expect(b).toHoequal(a);
        expect(b).toBeInstanceOf(MySet);

        const c = Hoek.clone(a, { prototype: false });

        expect(c).not.toHoequal(a, { prototype: true });
        expect(c).toHoequal(a, { prototype: false });
        expect(c).toBeInstanceOf(Set);
        expect(c).not.toBeInstanceOf(MySet);
    });

    it('clones Set containing objects (no pass by reference)', () => {
        const a = new Set<number | typeof nestedObj>([1, 2, 3]);

        a.add(nestedObj);

        const b = Hoek.clone(a);

        expect(b).toHoequal(a);
        expect(b).not.toBe(a);
        expect(b.has(nestedObj)).toBe(false);
    });

    it('clones a Map', () => {
        const a = new Map([
            ['a', 1],
            ['b', 2],
            ['c', 3],
        ]);
        const b = Hoek.clone(a);

        expect(b).toHoequal(a);
        expect(b).not.toHoequal(new Map());
        expect(b).not.toBe(a);

        // Verify key ordering

        const aIter = a.keys();
        for (const key of b.keys()) {
            expect(key).toHoequal(aIter.next().value!);
        }
    });

    it('clones properties set on Map', () => {
        const a = new Map([['a', 1]]) as Map<string, number> & {
            val: { b: number };
        };
        a.val = { b: 2 };

        const b = Hoek.clone(a);

        expect(b).toHoequal(a);
        expect(b.val).toHoequal(a.val);
        expect(b.val).not.toBe(a.val);
    });

    it('clones subclassed Map', () => {
        const MyMap = class extends Map<string, number> {};

        const a = new MyMap([['a', 1]]);
        const b = Hoek.clone(a);

        expect(b).toHoequal(a);
        expect(b).toBeInstanceOf(MyMap);

        const c = Hoek.clone(a, { prototype: false });

        expect(c).not.toHoequal(a, { prototype: true });
        expect(c).toHoequal(a, { prototype: false });
        expect(c).toBeInstanceOf(Map);
        expect(c).not.toBeInstanceOf(MyMap);
    });

    it('clones Map containing objects as values (no pass by reference)', () => {
        const a = new Map();
        a.set('a', 1);
        a.set('b', 2);
        a.set('c', nestedObj);

        const b = Hoek.clone(a);

        expect(b).toHoequal(a);
        expect(b).not.toBe(a);
        expect(b.get('c')).toHoequal(a.get('c'));
        expect(b.get('c')).not.toBe(a.get('c'));
    });

    it('clones Map containing objects as keys (passed by reference)', () => {
        const a = new Map();
        a.set('a', 1);
        a.set('b', 2);
        a.set(nestedObj, 3);

        const b = Hoek.clone(a);

        expect(b).toHoequal(a);
        expect(b).not.toBe(a);
        expect(b.get(nestedObj)).toHoequal(a.get(nestedObj));
    });

    it('clones an URL', () => {
        const a = new URL('https://hapi.dev/');
        const b = Hoek.clone(a);

        expect(b.href).toEqual(a.href);
        expect(b).not.toBe(a);
    });

    it('clones Error', () => {
        class CustomError extends Error {
            name = 'CustomError';
            test?: symbol;
        }

        const a = new CustomError('bad');

        a.test = Symbol('test');

        const b = Hoek.clone(a);

        expect(b).toHoequal(a);
        expect(b).not.toBe(a);
        expect(b).toBeInstanceOf(CustomError);
        expect(b.stack).toHoequal(a.stack); // Explicitly validate the .stack getters
    });

    it('clones Error with cause', () => {
        const a = new TypeError('bad', { cause: new Error('embedded') }) as TypeError & {
            cause?: Error;
        };
        const b = Hoek.clone(a);

        expect(b).toHoequal(a);
        expect(b).not.toBe(a);
        expect(b).toBeInstanceOf(TypeError);
        expect(b.stack).toHoequal(a.stack); // Explicitly validate the .stack getters
        expect(b.cause!.stack).toHoequal(a.cause!.stack); // Explicitly validate the .stack getters
    });

    it('clones Error with error message', () => {
        const a = new Error();
        a.message = new Error('message') as unknown as string;

        const b = Hoek.clone(a);

        //expect(b).toHoequal(a);                           // deepEqual() always compares message using ===
        expect(b.message).toHoequal(a.message);
        expect(b.message).not.toBe(a.message);
        expect(b.stack).toHoequal(a.stack);
    });

    it('clones Error with function property', () => {
        const a: any = new Error('hello');
        a.fun = new Function();

        const b = Hoek.clone(a);

        expect(b).toEqual(a);
        expect(b.stack).toEqual(a.stack);
    });

    it('clones legacy extended Error with function property', () => {
        const CustomError = function (this: any) {
            Error.call(this);
        };

        Object.setPrototypeOf(CustomError.prototype, Error.prototype);

        const a: any = new (CustomError as any)('hello');
        a.fun = new Function();

        const b = Hoek.clone(a);

        expect(b).toEqual(a);
        expect(b.stack).toEqual(a.stack);
    });

    it('cloned Error handles late stack update', () => {
        const a = new Error('bad');
        const b = Hoek.clone(a);

        a.stack = 'late update';

        expect(b).toHoequal(a);
        expect(b.stack).not.toHoequal(a.stack);
    });

    it('ignores symbols', () => {
        const sym = Symbol();
        const source = {
            a: {
                b: 5,
            },
            [sym]: {
                d: 6,
            },
        };

        const copy = Hoek.clone(source, { symbols: false });
        expect(copy).toHoequal(source, { symbols: false });
        expect(Hoek.deepEqual(source, copy)).toBe(false);
        expect(copy).not.toBe(source);
        expect(copy.a).not.toBe(source.a);
        expect(copy[sym]).toBeUndefined();
    });

    it('deep clones except for listed keys', () => {
        const source = {
            a: {
                b: 5,
            },
            c: {
                d: 6,
            },
            e() {},
        };

        const copy = Hoek.clone(source, { shallow: ['c', 'e'] });
        expect(copy).toHoequal(source);
        expect(copy).not.toBe(source);
        expect(copy.a).not.toBe(source.a);
        expect(copy.c).toBe(source.c);
        expect(copy.e).toBe(source.e);
    });

    it('returns immutable value', () => {
        expect(Hoek.clone(5, { shallow: [] })).toEqual(5);
    });

    it('returns null value', () => {
        expect(Hoek.clone(null, { shallow: [] })).toBeNull();
    });

    it('returns undefined value', () => {
        expect(Hoek.clone(undefined, { shallow: [] })).toBeUndefined();
    });

    it('deep clones except for listed keys (including missing keys)', () => {
        const source = {
            a: {
                b: 5,
            },
            c: {
                d: 6,
            },
        };

        const copy = Hoek.clone(source, { shallow: ['c', 'v'] });
        expect(copy).toHoequal(source);
        expect(copy).not.toBe(source);
        expect(copy.a).not.toBe(source.a);

        // @ts-expect-error - intentionally testing missing key
        expect(copy.b).toHoequal(source.b);
    });

    it('supports shallow symbols', () => {
        const sym = Symbol();
        const source = {
            a: {
                b: 5,
            },
            [sym]: {
                d: 6,
            },
        };

        const copy = Hoek.clone(source, { shallow: [[sym]], symbols: true });
        expect(copy).toHoequal(source);
        expect(copy).not.toBe(source);
        expect(copy.a).not.toBe(source.a);
        expect(copy[sym]).toHoequal(source[sym]);
    });

    it('shallow clones an entire object', () => {
        type Nested = {
            a: {
                b: number;
            };
            x?: Nested;
            test?: number;
        };

        const obj = {
            a: {
                b: 1,
            },
        } as Nested;

        obj.x = obj;

        const value = 1;
        let execCount = 0;

        Object.defineProperty(obj, 'test', {
            enumerable: true,
            configurable: true,
            get: function () {
                ++execCount;
                return value;
            },
        });

        const copy = Hoek.clone(obj, { shallow: true });
        expect(execCount).toEqual(0);
        expect(copy.test).toEqual(1);
        expect(execCount).toEqual(1);
        expect(copy.a).toBe(obj.a);
        expect(copy.x).toBe(obj);
    });

    it('does not invoke setter when shallow cloning', () => {
        const obj = {} as {
            a: object;
            b: object;
        };

        Object.defineProperty(obj, 'a', { enumerable: true, value: {} });
        Object.defineProperty(obj, 'b', { enumerable: true, value: {} });

        const copy = Hoek.clone(obj, { shallow: ['a'] });

        expect(copy).toHoequal({ a: {}, b: {} });
        expect(copy.a).toBe(obj.a);
    });

    it('prevents prototype poisoning', () => {
        const a = JSON.parse('{ "__proto__": { "x": 1 } }');
        expect(a.x).toBeUndefined();

        const b = Hoek.clone(a);
        expect(b.x).toBeUndefined();
    });

    it(
        'handles structuredClone not returning proper Error instances',
        { skip: typeof structuredClone !== 'function' },
        () => {
            // This can happen when running in a VM

            const error = new Error('blam');
            let cloned: Error | undefined;

            const origStructuredClone = structuredClone;

            try {
                global.structuredClone = function <T>(this: typeof structuredClone, obj: T): T {
                    const clone = origStructuredClone.call(this, obj);
                    if (obj === error) {
                        Object.setPrototypeOf(clone, Object);
                    }

                    return clone as T;
                } as unknown as typeof structuredClone;

                cloned = Hoek.clone(error);
            } finally {
                global.structuredClone = origStructuredClone;
            }

            expect(cloned).toBeInstanceOf(Error);
            expect(cloned).toHoequal(error);
        },
    );
});
