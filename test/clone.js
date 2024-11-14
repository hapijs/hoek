'use strict';

const Code = require('@hapi/code');
const Hoek = require('..');
const Lab = require('@hapi/lab');


const internals = {};


const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


const nestedObj = {
    v: [7, 8, 9],
    w: /^something$/igm,
    x: {
        a: [1, 2, 3],
        b: 123456,
        c: new Date(),
        d: /hi/igm,
        e: /hello/
    },
    y: 'y',
    z: new Date(1378775452757)
};


describe('clone()', () => {

    it('clones a nested object', () => {

        const a = nestedObj;
        const b = Hoek.clone(a);

        expect(a).to.equal(b);
        expect(a.z.getTime()).to.equal(b.z.getTime());
    });

    it('clones a null object', () => {

        const b = Hoek.clone(null);

        expect(b).to.equal(null);
    });

    it('should not convert undefined properties to null', () => {

        const obj = { something: undefined };
        const b = Hoek.clone(obj);

        expect(typeof b.something).to.equal('undefined');
    });

    it('should not throw on circular reference', () => {

        const a = {};
        a.x = a;

        expect(() => {

            Hoek.clone(a);
        }).to.not.throw();
    });

    it('clones circular reference', () => {

        const x = {
            'z': new Date()
        };
        x.y = x;

        const b = Hoek.clone(x);
        expect(Object.keys(b.y)).to.equal(Object.keys(x));
        expect(b.z).to.not.shallow.equal(x.z);
        expect(b.y).to.not.shallow.equal(x.y);
        expect(b.y.z).to.not.shallow.equal(x.y.z);
        expect(b.y).to.equal(b);
        expect(b.y.y.y.y).to.equal(b);
    });

    it('clones an object with a null prototype', () => {

        const obj = Object.create(null);
        const b = Hoek.clone(obj);

        expect(b).to.equal(obj);
    });

    it('clones deeply nested object', () => {

        const a = {
            x: {
                y: {
                    a: [1, 2, 3],
                    b: 123456,
                    c: new Date(),
                    d: /hi/igm,
                    e: /hello/
                }
            }
        };

        const b = Hoek.clone(a);

        expect(a).to.equal(b);
        expect(a.x.y.c.getTime()).to.equal(b.x.y.c.getTime());
    });

    it('clones deeply nested set with circular references', () => {

        const s = new Set();
        s.add('a');
        s.add('b');
        s.add(s);

        const a = {
            x: {
                y: {
                    a: s
                }
            }
        };

        const b = Hoek.clone(a);

        expect(b).to.equal(a);
        expect(b).to.not.equal(new Set(['a', 'b', s]));
        expect(b).to.not.shallow.equal(a);

        // Verify ordering

        const aIter = a.x.y.a.values();
        for (const value of b.x.y.a.values()) {
            expect(value).to.equal(aIter.next().value);
        }
    });

    it('shallow clones set', () => {

        const set = new Set();
        set.add('a');
        set.add('b');
        set.add(set);

        const clone = Hoek.clone(set, { shallow: true });

        expect(clone).to.equal(set);
        expect(clone.has(set)).to.be.true();
    });

    it('clones deeply nested map with circular references', () => {

        const m = new Map();
        m.set('a', 'a');
        m.set('b', 'b');
        m.set('c', m);

        const a = {
            x: {
                y: {
                    a: m
                }
            }
        };

        const b = Hoek.clone(a);

        // Verify key ordering

        const aIter = a.x.y.a.keys();
        for (const key of b.x.y.a.keys()) {
            expect(key).to.equal(aIter.next().value);
        }
    });

    it('shallow clones map', () => {

        const map = new Map();
        map.set('a', { x: 1 });
        map.set(map, map);

        const clone = Hoek.clone(map, { shallow: true });

        expect(clone).to.equal(map);
        expect(clone.has(map)).to.be.true();
        expect(clone.get('a')).to.shallow.equal(map.get('a'));
    });

    it('clones arrays', () => {

        const a = [1, 2, 3];

        const b = Hoek.clone(a);

        expect(a).to.equal(b);
    });

    it('clones holey arrays', () => {

        const a = new Array(3);
        a[1] = 'one';

        const b = Hoek.clone(a);

        expect(a).to.equal(b);
    });

    it('clones array-based class', () => {

        const A = class extends Array {
            __x = 1;

            __y() {

                return 2;
            }
        };

        const a = new A(1, 2, 3);

        const b = Hoek.clone(a);

        expect(a).to.equal(b);
        expect(b.__x).to.equal(1);
        expect(b.__y).to.exist();
        expect(b.__y()).to.equal(2);
    });

    it('clones array-based class (without prototype)', () => {

        const A = class extends Array {
            __x = 1;

            __y() {

                return 2;
            }
        };

        const a = new A(1, 2, 3);

        const b = Hoek.clone(a, { prototype: false });

        expect(a).to.equal(b);
        expect(b.__x).to.equal(1);
        expect(b.__y).to.not.exist();
    });

    it('clones symbol properties', () => {

        const sym1 = Symbol(1);
        const sym2 = Symbol(2);
        const a = { [sym1]: 1 };
        Object.defineProperty(a, sym2, { value: 2 });

        const b = Hoek.clone(a);

        expect(a).to.equal(b);
        expect(b[sym1]).to.be.equal(1);
        expect(b[sym2]).to.be.equal(2);

        expect(Hoek.deepEqual(a, b)).to.be.true();
    });

    it('performs actual copy for shallow keys (no pass by reference)', () => {

        const x = Hoek.clone(nestedObj);
        const y = Hoek.clone(nestedObj);

        // Date
        expect(x.z).to.not.shallow.equal(nestedObj.z);
        expect(x.z).to.not.shallow.equal(y.z);

        // Regex
        expect(x.w).to.not.shallow.equal(nestedObj.w);
        expect(x.w).to.not.shallow.equal(y.w);

        // Array
        expect(x.v).to.not.shallow.equal(nestedObj.v);
        expect(x.v).to.not.shallow.equal(y.v);

        // Immutable(s)
        x.y = 5;
        expect(x.y).to.not.equal(nestedObj.y);
        expect(x.y).to.not.equal(y.y);
    });

    it('performs actual copy for deep keys (no pass by reference)', () => {

        const x = Hoek.clone(nestedObj);
        const y = Hoek.clone(nestedObj);

        expect(x.x.c).to.not.shallow.equal(nestedObj.x.c);
        expect(x.x.c).to.not.shallow.equal(y.x.c);

        expect(x.x.c.getTime()).to.equal(nestedObj.x.c.getTime());
        expect(x.x.c.getTime()).to.equal(y.x.c.getTime());
    });

    it('copies functions with properties', () => {

        const a = {
            x: function () {

                return 1;
            },
            y: {}
        };
        a.x.z = 'string in function';
        a.x.v = function () {

            return 2;
        };

        a.y.u = a.x;

        const b = Hoek.clone(a);
        expect(b.x()).to.equal(1);
        expect(b.x.v()).to.equal(2);
        expect(b.y.u).to.equal(b.x);
        expect(b.x.z).to.equal('string in function');
    });

    it('should copy a buffer', () => {

        const tls = {
            key: Buffer.from([1, 2, 3, 4, 5]),
            cert: Buffer.from([1, 2, 3, 4, 5, 6, 10])
        };

        const copiedTls = Hoek.clone(tls);
        expect(Buffer.isBuffer(copiedTls.key)).to.equal(true);
        expect(JSON.stringify(copiedTls.key)).to.equal(JSON.stringify(tls.key));
        expect(Buffer.isBuffer(copiedTls.cert)).to.equal(true);
        expect(JSON.stringify(copiedTls.cert)).to.equal(JSON.stringify(tls.cert));

        tls.key.write('hi');
        expect(JSON.stringify(copiedTls.key)).to.not.equal(JSON.stringify(tls.key));
    });

    it('clones an object with a prototype', () => {

        const Obj = function () {

            this.a = 5;
        };

        Obj.prototype.b = function () {

            return 'c';
        };

        const a = new Obj();
        const b = Hoek.clone(a);

        expect(b.a).to.equal(5);
        expect(b.b()).to.equal('c');
        expect(a).to.equal(b);
    });

    it('clones an object without a prototype', () => {

        const Obj = function () {

            this.a = 5;
        };

        Obj.prototype.b = function () {

            return 'c';
        };

        const a = new Obj();
        a.x = 123;

        const b = Hoek.clone(a, { prototype: false });

        expect(a).to.equal(b);
        expect(a).to.not.equal(b, { prototype: true });
        expect(b.a).to.equal(5);
        expect(b.b).to.not.exist();
        expect(b.x).to.equal(123);
    });

    it('reuses cloned Date object', () => {

        const obj = {
            a: new Date()
        };

        obj.b = obj.a;

        const copy = Hoek.clone(obj);
        expect(copy.a).to.equal(copy.b);
    });

    it('shallow copies an object with a prototype and isImmutable flag', () => {

        const Obj = function () {

            this.value = 5;
        };

        Obj.prototype.b = function () {

            return 'c';
        };

        Obj.prototype.isImmutable = true;

        const obj = {
            a: new Obj()
        };

        const copy = Hoek.clone(obj);

        expect(obj.a.value).to.equal(5);
        expect(copy.a.value).to.equal(5);
        expect(copy.a.b()).to.equal('c');
        expect(obj.a).to.equal(copy.a);
    });

    it('clones an object with property getter without executing it', () => {

        const obj = {};
        const value = 1;
        let execCount = 0;

        Object.defineProperty(obj, 'test', {
            enumerable: true,
            configurable: true,
            get: function () {

                ++execCount;
                return value;
            }
        });

        const copy = Hoek.clone(obj);
        expect(execCount).to.equal(0);
        expect(copy.test).to.equal(1);
        expect(execCount).to.equal(1);
    });

    it('clones an object with property getter and setter', () => {

        const obj = {
            _test: 0
        };

        Object.defineProperty(obj, 'test', {
            enumerable: true,
            configurable: true,
            get: function () {

                return this._test;
            },
            set: function (value) {

                this._test = value - 1;
            }
        });

        const copy = Hoek.clone(obj);
        expect(copy.test).to.equal(0);
        copy.test = 5;
        expect(copy.test).to.equal(4);
    });

    it('clones an object with only property setter', () => {

        const obj = {
            _test: 0
        };

        Object.defineProperty(obj, 'test', {
            enumerable: true,
            configurable: true,
            set: function (value) {

                this._test = value - 1;
            }
        });

        const copy = Hoek.clone(obj);
        expect(copy._test).to.equal(0);
        copy.test = 5;
        expect(copy._test).to.equal(4);
    });

    it('clones an object with non-enumerable properties', () => {

        const obj = {
            _test: 0
        };

        Object.defineProperty(obj, 'test', {
            enumerable: false,
            configurable: true,
            set: function (value) {

                this._test = value - 1;
            }
        });

        const copy = Hoek.clone(obj);
        expect(copy._test).to.equal(0);
        copy.test = 5;
        expect(copy._test).to.equal(4);
    });

    it('clones an object where getOwnPropertyDescriptor returns undefined', () => {

        const oldGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
        const obj = { a: 'b' };
        Object.getOwnPropertyDescriptor = function () {

            return undefined;
        };

        const copy = Hoek.clone(obj);
        Object.getOwnPropertyDescriptor = oldGetOwnPropertyDescriptor;
        expect(copy).to.equal(obj);
    });

    it('clones own property when class property is not writable', () => {

        const Cl = class {

            get x() {

                return 'hi';
            }
        };

        const obj = new Cl();

        Object.defineProperty(obj, 'x', {
            value: 0, writable: true
        });

        const copy = Hoek.clone(obj);
        expect(copy).to.equal(obj);
    });

    it('clones a Set', () => {

        const a = new Set([1, 2, 3]);
        const b = Hoek.clone(a);

        expect(b).to.equal(a);
        expect(b).to.not.equal(new Set([2, 3, 4]));
        expect(b).to.not.shallow.equal(a);

        // Verify ordering

        const aIter = a.values();
        for (const value of b.values()) {
            expect(value).to.equal(aIter.next().value);
        }
    });

    it('clones properties set on a Set', () => {

        const a = new Set([1]);
        a.val = { b: 2 };

        const b = Hoek.clone(a);

        expect(b).to.equal(a);
        expect(b.val).to.equal(a.val);
        expect(b.val).to.not.shallow.equal(a.val);
    });

    it('clones subclassed Set', () => {

        const MySet = class extends Set { };

        const a = new MySet([1]);
        const b = Hoek.clone(a);

        expect(b).to.equal(a);
        expect(b).to.be.instanceof(MySet);

        const c = Hoek.clone(a, { prototype: false });

        expect(c).to.not.equal(a, { prototype: true });
        expect(c).to.equal(a, { prototype: false });
        expect(c).to.be.instanceof(Set);
        expect(c).to.not.be.instanceof(MySet);
    });

    it('clones Set containing objects (no pass by reference)', () => {

        const a = new Set([1, 2, 3]);
        a.add(nestedObj);

        const b = Hoek.clone(a);

        expect(b).to.equal(a);
        expect(b).to.not.shallow.equal(a);
        expect(b.has(nestedObj)).to.be.false(a);
    });

    it('clones a Map', () => {

        const a = new Map([['a', 1], ['b', 2], ['c', 3]]);
        const b = Hoek.clone(a);

        expect(b).to.equal(a);
        expect(b).to.not.equal(new Map());
        expect(b).to.not.shallow.equal(a);

        // Verify key ordering

        const aIter = a.keys();
        for (const key of b.keys()) {
            expect(key).to.equal(aIter.next().value);
        }
    });

    it('clones properties set on Map', () => {

        const a = new Map([['a', 1]]);
        a.val = { b: 2 };

        const b = Hoek.clone(a);

        expect(b).to.equal(a);
        expect(b.val).to.equal(a.val);
        expect(b.val).to.not.shallow.equal(a.val);
    });

    it('clones subclassed Map', () => {

        const MyMap = class extends Map { };

        const a = new MyMap([['a', 1]]);
        const b = Hoek.clone(a);

        expect(b).to.equal(a);
        expect(b).to.be.instanceof(MyMap);

        const c = Hoek.clone(a, { prototype: false });

        expect(c).to.not.equal(a, { prototype: true });
        expect(c).to.equal(a, { prototype: false });
        expect(c).to.be.instanceof(Map);
        expect(c).to.not.be.instanceof(MyMap);
    });

    it('clones Map containing objects as values (no pass by reference)', () => {

        const a = new Map();
        a.set('a', 1);
        a.set('b', 2);
        a.set('c', nestedObj);

        const b = Hoek.clone(a);

        expect(b).to.equal(a);
        expect(b).to.not.shallow.equal(a);
        expect(b.get('c')).to.equal(a.get('c'));
        expect(b.get('c')).to.not.shallow.equal(a.get('c'));
    });

    it('clones Map containing objects as keys (passed by reference)', () => {

        const a = new Map();
        a.set('a', 1);
        a.set('b', 2);
        a.set(nestedObj, 3);

        const b = Hoek.clone(a);

        expect(b).to.equal(a);
        expect(b).to.not.shallow.equal(a);
        expect(b.get(nestedObj)).to.equal(a.get(nestedObj));
    });

    it('clones an URL', () => {

        const a = new URL('https://hapi.dev/');
        const b = Hoek.clone(a);

        expect(b.href).to.equal(a.href);
        expect(b).to.not.shallow.equal(a);
    });

    it('clones Error', () => {

        class CustomError extends Error {
            name = 'CustomError';
        }

        const a = new CustomError('bad');
        a.test = Symbol('test');

        const b = Hoek.clone(a);

        expect(b).to.equal(a);
        expect(b).to.not.shallow.equal(a);
        expect(b).to.be.instanceOf(CustomError);
        expect(b.stack).to.equal(a.stack);                 // Explicitly validate the .stack getters
    });

    it('clones Error with cause', { skip: process.version.startsWith('v14') }, () => {

        const a = new TypeError('bad', { cause: new Error('embedded') });
        const b = Hoek.clone(a);

        expect(b).to.equal(a);
        expect(b).to.not.shallow.equal(a);
        expect(b).to.be.instanceOf(TypeError);
        expect(b.stack).to.equal(a.stack);                 // Explicitly validate the .stack getters
        expect(b.cause.stack).to.equal(a.cause.stack);     // Explicitly validate the .stack getters
    });

    it('clones Error with error message', () => {

        const a = new Error();
        a.message = new Error('message');

        const b = Hoek.clone(a);

        //expect(b).to.equal(a);                           // deepEqual() always compares message using ===
        expect(b.message).to.equal(a.message);
        expect(b.message).to.not.shallow.equal(a.message);
        expect(b.stack).to.equal(a.stack);
    });

    it('clones Error with function property', () => {

        const a = new Error('hello');
        a.fun = new Function();

        const b = Hoek.clone(a);

        expect(b).to.equal(a);
        expect(b.stack).to.equal(a.stack);
    });

    it('clones legacy extended Error with function property', () => {

        const CustomError = function () {

            Error.call(this);
        };

        Object.setPrototypeOf(CustomError.prototype, Error.prototype);

        const a = new CustomError('hello');
        a.fun = new Function();

        const b = Hoek.clone(a);

        expect(b).to.equal(a);
        expect(b.stack).to.equal(a.stack);
    });

    it('cloned Error handles late stack update', () => {

        const a = new Error('bad');
        const b = Hoek.clone(a);

        a.stack = 'late update';

        expect(b).to.equal(a);
        expect(b.stack).to.not.equal(a.stack);
    });

    it('ignores symbols', () => {

        const sym = Symbol();
        const source = {
            a: {
                b: 5
            },
            [sym]: {
                d: 6
            }
        };

        const copy = Hoek.clone(source, { symbols: false });
        expect(copy).to.equal(source, { symbols: false });
        expect(Hoek.deepEqual(source, copy)).to.be.false();
        expect(copy).to.not.shallow.equal(source);
        expect(copy.a).to.not.shallow.equal(source.a);
        expect(copy[sym]).to.not.exist();
    });

    it('deep clones except for listed keys', () => {

        const source = {
            a: {
                b: 5
            },
            c: {
                d: 6
            },
            e() { }
        };

        const copy = Hoek.clone(source, { shallow: ['c', 'e'] });
        expect(copy).to.equal(source);
        expect(copy).to.not.shallow.equal(source);
        expect(copy.a).to.not.shallow.equal(source.a);
        expect(copy.c).to.shallow.equal(source.c);
        expect(copy.e).to.shallow.equal(source.e);
    });

    it('returns immutable value', () => {

        expect(Hoek.clone(5, { shallow: [] })).to.equal(5);
    });

    it('returns null value', () => {

        expect(Hoek.clone(null, { shallow: [] })).to.equal(null);
    });

    it('returns undefined value', () => {

        expect(Hoek.clone(undefined, { shallow: [] })).to.equal(undefined);
    });

    it('deep clones except for listed keys (including missing keys)', () => {

        const source = {
            a: {
                b: 5
            },
            c: {
                d: 6
            }
        };

        const copy = Hoek.clone(source, { shallow: ['c', 'v'] });
        expect(copy).to.equal(source);
        expect(copy).to.not.shallow.equal(source);
        expect(copy.a).to.not.shallow.equal(source.a);
        expect(copy.b).to.equal(source.b);
    });

    it('supports shallow symbols', () => {

        const sym = Symbol();
        const source = {
            a: {
                b: 5
            },
            [sym]: {
                d: 6
            }
        };

        const copy = Hoek.clone(source, { shallow: [[sym]], symbols: true });
        expect(copy).to.equal(source);
        expect(copy).to.not.shallow.equal(source);
        expect(copy.a).to.not.shallow.equal(source.a);
        expect(copy[sym]).to.equal(source[sym]);
    });

    it('shallow clones an entire object', () => {

        const obj = {
            a: {
                b: 1
            }
        };

        obj.x = obj;

        const value = 1;
        let execCount = 0;

        Object.defineProperty(obj, 'test', {
            enumerable: true,
            configurable: true,
            get: function () {

                ++execCount;
                return value;
            }
        });

        const copy = Hoek.clone(obj, { shallow: true });
        expect(execCount).to.equal(0);
        expect(copy.test).to.equal(1);
        expect(execCount).to.equal(1);
        expect(copy.a).to.shallow.equal(obj.a);
        expect(copy.x).to.shallow.equal(obj);
    });

    it('does not invoke setter when shallow cloning', () => {

        const obj = {};

        Object.defineProperty(obj, 'a', { enumerable: true, value: {} });
        Object.defineProperty(obj, 'b', { enumerable: true, value: {} });

        const copy = Hoek.clone(obj, { shallow: ['a'] });

        expect(copy).equal({ a: {}, b: {} });
        expect(copy.a).to.shallow.equal(obj.a);
    });

    it('prevents prototype poisoning', () => {

        const a = JSON.parse('{ "__proto__": { "x": 1 } }');
        expect(a.x).to.not.exist();

        const b = Hoek.clone(a);
        expect(b.x).to.not.exist();
    });

    it('handles structuredClone not returning proper Error instances', { skip: typeof structuredClone !== 'function' }, () => {

        // This can happen when running in a VM

        const error = new Error('blam');

        const origStructuredClone = structuredClone;
        try {
            structuredClone = function (obj) {

                const clone = origStructuredClone.call(this, obj);
                if (obj === error) {
                    Object.setPrototypeOf(clone, Object);
                }

                return clone;
            };

            var cloned = Hoek.clone(error);
        }
        finally {
            structuredClone = origStructuredClone;
        }

        expect(cloned).to.be.instanceOf(Error);
        expect(cloned).to.equal(error);
    });
});
