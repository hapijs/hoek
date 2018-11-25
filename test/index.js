'use strict';

// Load modules

const Path = require('path');
const Util = require('util');

const Code = require('code');
const Hoek = require('../lib');
const Lab = require('lab');


// Declare internals

const internals = {};


// Test shortcuts

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
});

describe('merge()', () => {

    it('deep copies source items', () => {

        const target = {
            b: 3,
            d: []
        };

        const source = {
            c: {
                d: 1
            },
            d: [{ e: 1 }]
        };

        Hoek.merge(target, source);
        expect(target.c).to.not.shallow.equal(source.c);
        expect(target.c).to.equal(source.c);
        expect(target.d).to.not.shallow.equal(source.d);
        expect(target.d[0]).to.not.shallow.equal(source.d[0]);
        expect(target.d).to.equal(source.d);
    });

    it('merges array over an object', () => {

        const a = {
            x: ['n', 'm']
        };

        const b = {
            x: {
                n: '1',
                m: '2'
            }
        };

        Hoek.merge(b, a);
        expect(a.x[0]).to.equal('n');
        expect(a.x.n).to.not.exist();
    });

    it('merges object over an array', () => {

        const a = {
            x: ['n', 'm']
        };

        const b = {
            x: {
                n: '1',
                m: '2'
            }
        };

        Hoek.merge(a, b);
        expect(a.x.n).to.equal('1');
        expect(a.x[0]).to.not.exist();
    });

    it('merges from null prototype objects', () => {

        const a = {};

        const b = Object.create(null);
        b.x = true;

        Hoek.merge(a, b);
        expect(a.x).to.be.true();
    });

    it('skips non-enumerable properties', () => {

        const a = { x: 0 };

        const b = {};
        Object.defineProperty(b, 'x', {
            enumerable: false,
            value: 1
        });

        Hoek.merge(a, b);
        expect(a.x).to.equal(0);
    });

    it('does not throw if source is null', () => {

        const a = {};
        const b = null;
        let c = null;

        expect(() => {

            c = Hoek.merge(a, b);
        }).to.not.throw();

        expect(c).to.equal(a);
    });

    it('does not throw if source is undefined', () => {

        const a = {};
        const b = undefined;
        let c = null;

        expect(() => {

            c = Hoek.merge(a, b);
        }).to.not.throw();

        expect(c).to.equal(a);
    });

    it('throws if source is not an object', () => {

        expect(() => {

            const a = {};
            const b = 0;

            Hoek.merge(a, b);
        }).to.throw('Invalid source value: must be null, undefined, or an object');
    });

    it('throws if target is not an object', () => {

        expect(() => {

            const a = 0;
            const b = {};

            Hoek.merge(a, b);
        }).to.throw('Invalid target value: must be an object');
    });

    it('throws if target is not an array and source is', () => {

        expect(() => {

            const a = {};
            const b = [1, 2];

            Hoek.merge(a, b);
        }).to.throw('Cannot merge array onto an object');
    });

    it('returns the same object when merging arrays', () => {

        const a = [];
        const b = [1, 2];

        expect(Hoek.merge(a, b)).to.equal(a);
    });

    it('combines an empty object with a non-empty object', () => {

        const a = {};
        const b = nestedObj;

        const c = Hoek.merge(a, b);
        expect(a).to.equal(b);
        expect(c).to.equal(b);
    });

    it('overrides values in target', () => {

        const a = { x: 1, y: 2, z: 3, v: 5, t: 'test', m: 'abc' };
        const b = { x: null, z: 4, v: 0, t: { u: 6 }, m: '123' };

        const c = Hoek.merge(a, b);
        expect(c.x).to.equal(null);
        expect(c.y).to.equal(2);
        expect(c.z).to.equal(4);
        expect(c.v).to.equal(0);
        expect(c.m).to.equal('123');
        expect(c.t).to.equal({ u: 6 });
    });

    it('overrides values in target (flip)', () => {

        const a = { x: 1, y: 2, z: 3, v: 5, t: 'test', m: 'abc' };
        const b = { x: null, z: 4, v: 0, t: { u: 6 }, m: '123' };

        const d = Hoek.merge(b, a);
        expect(d.x).to.equal(1);
        expect(d.y).to.equal(2);
        expect(d.z).to.equal(3);
        expect(d.v).to.equal(5);
        expect(d.m).to.equal('abc');
        expect(d.t).to.equal('test');
    });

    it('retains Date properties', () => {

        const a = { x: new Date(1378776452757) };

        const b = Hoek.merge({}, a);
        expect(a.x.getTime()).to.equal(b.x.getTime());
    });

    it('retains Date properties when merging keys', () => {

        const a = { x: new Date(1378776452757) };

        const b = Hoek.merge({ x: {} }, a);
        expect(a.x.getTime()).to.equal(b.x.getTime());
    });

    it('overrides Buffer', () => {

        const a = { x: Buffer.from('abc') };

        Hoek.merge({ x: {} }, a);
        expect(a.x.toString()).to.equal('abc');
    });

    it('overrides RegExp', () => {

        const a = { x: /test/ };

        Hoek.merge({ x: {} }, a);
        expect(a.x).to.equal(/test/);
    });

    it('skips __proto__', () => {

        const a = '{ "ok": "value", "__proto__": { "test": "value" } }';

        const b = Hoek.merge({}, JSON.parse(a));
        expect(b).to.equal({ ok: 'value' });
        expect(b.test).to.equal(undefined);
    });
});

describe('applyToDefaults()', () => {

    const defaults = {
        a: 1,
        b: 2,
        c: {
            d: 3,
            e: [5, 6]
        },
        f: 6,
        g: 'test'
    };

    it('throws when target is null', () => {

        expect(() => {

            Hoek.applyToDefaults(null, {});
        }).to.throw('Invalid defaults value: must be an object');
    });

    it('returns null if options is false', () => {

        const result = Hoek.applyToDefaults(defaults, false);
        expect(result).to.equal(null);
    });

    it('returns null if options is null', () => {

        const result = Hoek.applyToDefaults(defaults, null);
        expect(result).to.equal(null);
    });

    it('returns null if options is undefined', () => {

        const result = Hoek.applyToDefaults(defaults, undefined);
        expect(result).to.equal(null);
    });

    it('returns a copy of defaults if options is true', () => {

        const result = Hoek.applyToDefaults(defaults, true);
        expect(result).to.equal(defaults);
    });

    it('applies object to defaults', () => {

        const obj = {
            a: null,
            c: {
                e: [4]
            },
            f: 0,
            g: {
                h: 5
            }
        };

        const result = Hoek.applyToDefaults(defaults, obj);
        expect(result.c.e).to.equal([4]);
        expect(result.a).to.equal(1);
        expect(result.b).to.equal(2);
        expect(result.f).to.equal(0);
        expect(result.g).to.equal({ h: 5 });
    });

    it('applies object to defaults with null', () => {

        const obj = {
            a: null,
            c: {
                e: [4]
            },
            f: 0,
            g: {
                h: 5
            }
        };

        const result = Hoek.applyToDefaults(defaults, obj, true);
        expect(result.c.e).to.equal([4]);
        expect(result.a).to.equal(null);
        expect(result.b).to.equal(2);
        expect(result.f).to.equal(0);
        expect(result.g).to.equal({ h: 5 });
    });
});

describe('cloneWithShallow()', () => {

    it('deep clones except for listed keys', () => {

        const source = {
            a: {
                b: 5
            },
            c: {
                d: 6
            }
        };

        const copy = Hoek.cloneWithShallow(source, ['c']);
        expect(copy).to.equal(source);
        expect(copy).to.not.shallow.equal(source);
        expect(copy.a).to.not.shallow.equal(source.a);
        expect(copy.b).to.equal(source.b);
    });

    it('returns immutable value', () => {

        expect(Hoek.cloneWithShallow(5)).to.equal(5);
    });

    it('returns null value', () => {

        expect(Hoek.cloneWithShallow(null)).to.equal(null);
    });

    it('returns undefined value', () => {

        expect(Hoek.cloneWithShallow(undefined)).to.equal(undefined);
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

        const copy = Hoek.cloneWithShallow(source, ['c', 'v']);
        expect(copy).to.equal(source);
        expect(copy).to.not.shallow.equal(source);
        expect(copy.a).to.not.shallow.equal(source.a);
        expect(copy.b).to.equal(source.b);
    });
});

describe('applyToDefaultsWithShallow()', () => {

    it('shallow copies the listed keys from options without merging', () => {

        const defaults = {
            a: {
                b: 5,
                e: 3
            },
            c: {
                d: 7,
                g: 1
            }
        };

        const options = {
            a: {
                b: 4
            },
            c: {
                d: 6,
                f: 7
            }
        };

        const merged = Hoek.applyToDefaultsWithShallow(defaults, options, ['a']);
        expect(merged).to.equal({ a: { b: 4 }, c: { d: 6, g: 1, f: 7 } });
        expect(merged.a).to.equal(options.a);
        expect(merged.a).to.not.equal(defaults.a);
        expect(merged.c).to.not.equal(options.c);
        expect(merged.c).to.not.equal(defaults.c);
    });

    it('shallow copies the nested keys (override)', () => {

        const defaults = {
            a: {
                b: 5
            },
            c: {
                d: 7,
                g: 1
            }
        };

        const options = {
            a: {
                b: 4
            },
            c: {
                d: 6,
                g: {
                    h: 8
                }
            }
        };

        const merged = Hoek.applyToDefaultsWithShallow(defaults, options, ['c.g']);
        expect(merged).to.equal({ a: { b: 4 }, c: { d: 6, g: { h: 8 } } });
        expect(merged.c.g).to.equal(options.c.g);
    });

    it('shallow copies the nested keys (missing)', () => {

        const defaults = {
            a: {
                b: 5
            }
        };

        const options = {
            a: {
                b: 4
            },
            c: {
                g: {
                    h: 8
                }
            }
        };

        const merged = Hoek.applyToDefaultsWithShallow(defaults, options, ['c.g']);
        expect(merged).to.equal({ a: { b: 4 }, c: { g: { h: 8 } } });
        expect(merged.c.g).to.equal(options.c.g);
    });

    it('shallow copies the nested keys (override)', () => {

        const defaults = {
            a: {
                b: 5
            },
            c: {
                g: {
                    d: 7
                }
            }
        };

        const options = {
            a: {
                b: 4
            },
            c: {
                g: {
                    h: 8
                }
            }
        };

        const merged = Hoek.applyToDefaultsWithShallow(defaults, options, ['c.g']);
        expect(merged).to.equal({ a: { b: 4 }, c: { g: { h: 8 } } });
        expect(merged.c.g).to.equal(options.c.g);
    });

    it('shallow copies the nested keys (deeper)', () => {

        const defaults = {
            a: {
                b: 5
            }
        };

        const options = {
            a: {
                b: 4
            },
            c: {
                g: {
                    r: {
                        h: 8
                    }
                }
            }
        };

        const merged = Hoek.applyToDefaultsWithShallow(defaults, options, ['c.g.r']);
        expect(merged).to.equal({ a: { b: 4 }, c: { g: { r: { h: 8 } } } });
        expect(merged.c.g.r).to.equal(options.c.g.r);
    });

    it('shallow copies the nested keys (not present)', () => {

        const defaults = {
            a: {
                b: 5
            }
        };

        const options = {
            a: {
                b: 4
            },
            c: {
                g: {
                    r: {
                        h: 8
                    }
                }
            }
        };

        const merged = Hoek.applyToDefaultsWithShallow(defaults, options, ['x.y']);
        expect(merged).to.equal({ a: { b: 4 }, c: { g: { r: { h: 8 } } } });
    });

    it('shallow copies the listed keys in the defaults', () => {

        const defaults = {
            a: {
                b: 1
            }
        };

        const merged = Hoek.applyToDefaultsWithShallow(defaults, {}, ['a']);
        expect(merged.a).to.equal(defaults.a);
    });

    it('shallow copies the listed keys in the defaults (true)', () => {

        const defaults = {
            a: {
                b: 1
            }
        };

        const merged = Hoek.applyToDefaultsWithShallow(defaults, true, ['a']);
        expect(merged.a).to.equal(defaults.a);
    });

    it('returns null on false', () => {

        const defaults = {
            a: {
                b: 1
            }
        };

        const merged = Hoek.applyToDefaultsWithShallow(defaults, false, ['a']);
        expect(merged).to.equal(null);
    });

    it('throws on missing defaults', () => {

        expect(() => {

            Hoek.applyToDefaultsWithShallow(null, {}, ['a']);
        }).to.throw('Invalid defaults value: must be an object');
    });

    it('throws on invalid defaults', () => {

        expect(() => {

            Hoek.applyToDefaultsWithShallow('abc', {}, ['a']);
        }).to.throw('Invalid defaults value: must be an object');
    });

    it('throws on invalid options', () => {

        expect(() => {

            Hoek.applyToDefaultsWithShallow({}, 'abc', ['a']);
        }).to.throw('Invalid options value: must be true, falsy or an object');
    });

    it('throws on missing keys', () => {

        expect(() => {

            Hoek.applyToDefaultsWithShallow({}, true);
        }).to.throw('Invalid keys');
    });

    it('throws on invalid keys', () => {

        expect(() => {

            Hoek.applyToDefaultsWithShallow({}, true, 'a');
        }).to.throw('Invalid keys');
    });
});

describe('deepEqual()', () => {

    it('compares identical references', () => {

        const x = {};
        expect(Hoek.deepEqual(x, x)).to.be.true();
    });

    it('compares simple values', () => {

        expect(Hoek.deepEqual('x', 'x')).to.be.true();
        expect(Hoek.deepEqual('x', 'y')).to.be.false();
        expect(Hoek.deepEqual('x1', 'x')).to.be.false();
        expect(Hoek.deepEqual(-0, +0)).to.be.false();
        expect(Hoek.deepEqual(-0, -0)).to.be.true();
        expect(Hoek.deepEqual(+0, +0)).to.be.true();
        expect(Hoek.deepEqual(+0, -0)).to.be.false();
        expect(Hoek.deepEqual(1, 1)).to.be.true();
        expect(Hoek.deepEqual(0, 0)).to.be.true();
        expect(Hoek.deepEqual(-1, 1)).to.be.false();
        expect(Hoek.deepEqual(NaN, 0)).to.be.false();
        expect(Hoek.deepEqual(NaN, NaN)).to.be.true();
    });

    it('compares different types', () => {

        expect(Hoek.deepEqual([], 5, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual(5, [], { prototype: false })).to.be.false();
        expect(Hoek.deepEqual({}, null, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual(null, {}, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual('abc', {}, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual({}, 'abc', { prototype: false })).to.be.false();
    });

    it('compares empty structures', () => {

        expect(Hoek.deepEqual([], [])).to.be.true();
        expect(Hoek.deepEqual({}, {})).to.be.true();
        expect(Hoek.deepEqual([], {})).to.be.false();
        expect(Hoek.deepEqual([], {}, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual({}, [], { prototype: false })).to.be.false();
    });

    it('compares empty arguments object', () => {

        const compare = function () {

            expect(Hoek.deepEqual([], arguments)).to.be.false();            // eslint-disable-line prefer-rest-params
        };

        compare();
    });

    it('compares empty arguments objects', () => {

        const compare = function () {

            const arg1 = arguments;                                         // eslint-disable-line prefer-rest-params

            const inner = function () {

                // callee is not supported in strict mode, was previously false becuse callee was different
                expect(Hoek.deepEqual(arg1, arguments)).to.be.true();       // eslint-disable-line prefer-rest-params
            };

            inner();
        };

        compare();
    });

    it('compares dates', () => {

        expect(Hoek.deepEqual(new Date(2015, 1, 1), new Date('2015/02/01'))).to.be.true();
        expect(Hoek.deepEqual(new Date(100), new Date(101))).to.be.false();
        expect(Hoek.deepEqual(new Date(), {})).to.be.false();
        expect(Hoek.deepEqual(new Date(2015, 1, 1), new Date('2015/02/01'), { prototype: false })).to.be.true();
        expect(Hoek.deepEqual(new Date(), {}, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual({}, new Date(), { prototype: false })).to.be.false();
    });

    it('compares regular expressions', () => {

        expect(Hoek.deepEqual(/\s/, new RegExp('\\\s'))).to.be.true();
        expect(Hoek.deepEqual(/\s/g, /\s/g)).to.be.true();
        expect(Hoek.deepEqual(/a/, {}, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual(/\s/g, /\s/i)).to.be.false();
        expect(Hoek.deepEqual(/a/g, /b/g)).to.be.false();
    });

    it('compares errors', () => {

        expect(Hoek.deepEqual(new Error('a'), new Error('a'))).to.be.true();
        expect(Hoek.deepEqual(new Error('a'), new Error('b'))).to.be.false();
        expect(Hoek.deepEqual(new Error('a'), new TypeError('a'), { prototype: false })).to.be.false();
        expect(Hoek.deepEqual(new Error(), {}, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual({}, new Error(), { prototype: false })).to.be.false();
    });

    it('compares arrays', () => {

        expect(Hoek.deepEqual([[1]], [[1]])).to.be.true();
        expect(Hoek.deepEqual([1, 2, 3], [1, 2, 3])).to.be.true();
        expect(Hoek.deepEqual([1, 2, 3], [1, 3, 2])).to.be.false();
        expect(Hoek.deepEqual([1, 2, 3], [1, 2])).to.be.false();
        expect(Hoek.deepEqual([1], [1])).to.be.true();
        const item1 = { key: 'value1' };
        const item2 = { key: 'value2' };
        expect(Hoek.deepEqual([item1, item1], [item1, item2])).to.be.false();
    });

    it('compares sets', () => {

        expect(Hoek.deepEqual(new Set(), new Set())).to.be.true();
        expect(Hoek.deepEqual(new Set([1]), new Set([1]))).to.be.true();
        expect(Hoek.deepEqual(new Set([]), new Set([]))).to.be.true();
        expect(Hoek.deepEqual(new Set([1, 2, 3]), new Set([1, 2, 3]))).to.be.true();
        expect(Hoek.deepEqual(new Set([1, 2, 3]), new Set([3, 2, 1]))).to.be.true();
        expect(Hoek.deepEqual(new Set([1, 2, 3]), new Set([1, 2, 4]))).to.be.false();
        expect(Hoek.deepEqual(new Set([1, 2, 3]), new Set([1, 2]))).to.be.false();
        expect(Hoek.deepEqual(new Set([1, 2, 1]), new Set([1, 2]))).to.be.true();
        expect(Hoek.deepEqual(new Set([+0]), new Set([-0]))).to.be.true();
        expect(Hoek.deepEqual(new Set([NaN]), new Set([NaN]))).to.be.true();
        expect(Hoek.deepEqual(new Set([1, {}]), new Set([1, {}]))).to.be.true();
        expect(Hoek.deepEqual(new Set([1, {}]), new Set([{}, 1]))).to.be.true();
        expect(Hoek.deepEqual(new Set([1, {}, {}]), new Set([{}, 1, {}]))).to.be.true();
        expect(Hoek.deepEqual(new Set([1, { a: 1 }]), new Set([{ a: 0 }, 1]))).to.be.false();
        expect(Hoek.deepEqual(new WeakSet(), new WeakSet())).to.be.true();
        const obj = {};
        expect(Hoek.deepEqual(new WeakSet([obj]), new WeakSet())).to.be.true();
        expect(Hoek.deepEqual(new WeakSet(), new Set()), { prototype: false }).to.be.false();

        const sets = [new Set(), new Set()].map((set) => {

            set.modified = true;
            return set;
        });
        expect(Hoek.deepEqual(sets[0], sets[1])).to.be.true();
        expect(Hoek.deepEqual(sets[0], new Set())).to.be.false();
    });

    it('compares maps', () => {

        const item1 = { key: 'value1' };
        const item2 = { key: 'value2' };
        expect(Hoek.deepEqual(new Map(), new Map())).to.be.true();
        expect(Hoek.deepEqual(new Map([[1, {}]]), new Map([[1, {}]]))).to.be.true();
        expect(Hoek.deepEqual(new Map([[1, item1]]), new Map([[1, item1]]))).to.be.true();
        expect(Hoek.deepEqual(new Map([[1, item1]]), new Map([[1, item2]]))).to.be.false();
        expect(Hoek.deepEqual(new Map([[1, undefined]]), new Map([[1, undefined]]))).to.be.true();
        expect(Hoek.deepEqual(new Map([[1, undefined]]), new Map([[2, undefined]]))).to.be.false();
        expect(Hoek.deepEqual(new Map([[1, {}]]), new Map([[1, {}], [2, {}]]))).to.be.false();
        expect(Hoek.deepEqual(new Map([[item1, 1]]), new Map([[item1, 1]]))).to.be.true();
        expect(Hoek.deepEqual(new Map([[{}, 1]]), new Map([[{}, 1]]))).to.be.false();
        expect(Hoek.deepEqual(new WeakMap(), new WeakMap())).to.be.true();
        expect(Hoek.deepEqual(new WeakMap([[item1, 1]]), new WeakMap())).to.be.true();
        expect(Hoek.deepEqual(new WeakMap(), new Map()), { prototype: false }).to.be.false();

        const maps = [new Map(), new Map()].map((map) => {

            map.modified = true;
            return map;
        });
        expect(Hoek.deepEqual(maps[0], maps[1])).to.be.true();
        expect(Hoek.deepEqual(maps[0], new Map())).to.be.false();
    });

    it('compares buffers', () => {

        expect(Hoek.deepEqual(Buffer.from([1, 2, 3]), Buffer.from([1, 2, 3]))).to.be.true();
        expect(Hoek.deepEqual(Buffer.from([1, 2, 3]), Buffer.from([1, 3, 2]))).to.be.false();
        expect(Hoek.deepEqual(Buffer.from([1, 2, 3]), Buffer.from([1, 2]))).to.be.false();
        expect(Hoek.deepEqual(Buffer.from([1, 2, 3]), {})).to.be.false();
        expect(Hoek.deepEqual(Buffer.from([1, 2, 3]), [1, 2, 3])).to.be.false();
    });

    it('compares string objects', () => {

        /* eslint-disable no-new-wrappers */
        expect(Hoek.deepEqual(new String('a'), new String('a'))).to.be.true();
        expect(Hoek.deepEqual(new String('a'), new String('b'))).to.be.false();
        expect(Hoek.deepEqual(new String(''), {}, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual({}, new String(''), { prototype: false })).to.be.false();
        expect(Hoek.deepEqual(new String('a'), 'a', { prototype: false })).to.be.false();
        expect(Hoek.deepEqual('a', new String('a'), { prototype: false })).to.be.false();
        /* eslint-enable no-new-wrappers */
    });

    it('compares number objects', () => {

        /* eslint-disable no-new-wrappers */
        expect(Hoek.deepEqual(new Number(1), new Number(1))).to.be.true();
        expect(Hoek.deepEqual(new Number(1), new Number(2))).to.be.false();
        expect(Hoek.deepEqual(new Number(+0), new Number(-0))).to.be.false();
        expect(Hoek.deepEqual(new Number(NaN), new Number(NaN))).to.be.true();
        expect(Hoek.deepEqual(new Number(0), {}, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual({}, new Number(0), { prototype: false })).to.be.false();
        expect(Hoek.deepEqual(new Number(1), 1, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual(1, new Number(1), { prototype: false })).to.be.false();
        /* eslint-enable no-new-wrappers */
    });

    it('compares boolean objects', () => {

        /* eslint-disable no-new-wrappers */
        expect(Hoek.deepEqual(new Boolean(true), new Boolean(true))).to.be.true();
        expect(Hoek.deepEqual(new Boolean(true), new Boolean(false))).to.be.false();
        expect(Hoek.deepEqual(new Boolean(false), {}, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual({}, new Boolean(false), { prototype: false })).to.be.false();
        expect(Hoek.deepEqual(new Boolean(true), true, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual(true, new Boolean(true), { prototype: false })).to.be.false();
        /* eslint-enable no-new-wrappers */
    });

    it('compares objects', () => {

        expect(Hoek.deepEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3 })).to.be.true();
        expect(Hoek.deepEqual({ foo: 'bar' }, { foo: 'baz' })).to.be.false();
        expect(Hoek.deepEqual({ foo: { bar: 'foo' } }, { foo: { bar: 'baz' } })).to.be.false();
        expect(Hoek.deepEqual({ foo: undefined }, {})).to.be.false();
        expect(Hoek.deepEqual({}, { foo: undefined })).to.be.false();
        expect(Hoek.deepEqual({ foo: undefined }, { bar: undefined })).to.be.false();
    });

    it('handles circular dependency', () => {

        const a = {};
        a.x = a;

        const b = Hoek.clone(a);
        expect(Hoek.deepEqual(a, b)).to.be.true();
    });

    it('handles obj only circular dependency', () => {

        const a = {};
        a.x = a;

        const b = { x: {} };
        expect(Hoek.deepEqual(a, b)).to.be.false();
        expect(Hoek.deepEqual(b, a)).to.be.false();
    });

    it('handles irregular circular dependency', () => {

        const a = {};
        a.x = a;

        const b = { x: {} };
        b.x.x = b;

        const c = { x: { x: {} } };
        c.x.x.x = c;
        expect(Hoek.deepEqual(a, b)).to.be.true();
        expect(Hoek.deepEqual(b, a)).to.be.true();
        expect(Hoek.deepEqual(a, c)).to.be.true();
        expect(Hoek.deepEqual(b, c)).to.be.true();
        expect(Hoek.deepEqual(c, a)).to.be.true();
        expect(Hoek.deepEqual(c, b)).to.be.true();
        b.x.y = 1;
        expect(Hoek.deepEqual(a, b)).to.be.false();
        expect(Hoek.deepEqual(b, a)).to.be.false();
    });

    it('handles cross circular dependency', () => {

        const a = {};
        const b = { x: {}, y: a };
        b.x.x = b;
        b.x.y = b.x;
        a.x = b;
        a.y = a;
        expect(Hoek.deepEqual(b, a)).to.be.true();
        expect(Hoek.deepEqual(a, b)).to.be.true();
        b.x.y = 1;
        expect(Hoek.deepEqual(b, a)).to.be.false();
        expect(Hoek.deepEqual(a, b)).to.be.false();
    });

    it('handles reuse of objects', () => {

        const date1 = { year: 2018, month: 1, day: 1 };
        const date2 = { year: 2000, month: 1, day: 1 };

        expect(Hoek.deepEqual({ start: date1, end: date1 }, { start: date1, end: date2 })).to.be.false();
    });

    it('handles valueOf() that throws', () => {

        const throwing  = class {

            constructor(value) {

                this.value = value;
            }

            valueOf() {

                throw new Error('failed');
            }
        };

        expect(Hoek.deepEqual(new throwing('a'), new throwing('a'))).to.be.true();
        expect(Hoek.deepEqual(new throwing('a'), new throwing('b'))).to.be.false();
        expect(Hoek.deepEqual(new throwing('a'), { value: 'a' }, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual({ value: 'a' }, new throwing('a'), { prototype: false })).to.be.false();
    });

    it('handles valueOf() that returns similar value', () => {

        const identity = class {

            constructor(value) {

                this.value = value;
            }

            valueOf() {

                return { value: this.value };
            }
        };

        expect(Hoek.deepEqual(new identity('a'), new identity('a'))).to.be.true();
        expect(Hoek.deepEqual(new identity('a'), new identity('b'))).to.be.false();
        expect(Hoek.deepEqual(new identity('a'), { value: 'a' }, { prototype: true })).to.be.false();
        expect(Hoek.deepEqual(new identity('a'), { value: 'a' }, { prototype: false })).to.be.true();
        expect(Hoek.deepEqual({ value: 'a' }, new identity('a'), { prototype: true })).to.be.false();
        expect(Hoek.deepEqual({ value: 'a' }, new identity('a'), { prototype: false })).to.be.true();
    });

    it('skips enumerable properties on prototype chain', () => {

        const base = function (value, surprice) {

            this.value = value;
            if (surprice) {
                this.surprice = surprice;
            }
        };

        Object.defineProperty(base.prototype, 'enum', {
            enumerable: true,
            configurable: true,
            value: true
        });

        expect('enum' in new base('a')).to.be.true();
        expect(Hoek.deepEqual(new base('a'), new base('a'))).to.be.true();
        expect(Hoek.deepEqual(new base('a'), new base('b'))).to.be.false();
        expect(Hoek.deepEqual(new base('a'), { value: 'a' }, { prototype: false })).to.be.true();
        expect(Hoek.deepEqual({ value: 'a' }, new base('a'), { prototype: false })).to.be.true();
        expect(Hoek.deepEqual(new base('a', 1), { value: 'a', enum: true }, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual({ value: 'a', enum: true }, new base('a', 1), { prototype: false })).to.be.false();
    });

    it('skips non-enumerable properties', () => {

        const base = function Base(value, surprice) {

            this.value = value;
            if (surprice) {
                this.surprice = surprice;
            }
        };

        const createObj = (...args) => {

            const obj = new base(...args);

            Object.defineProperty(obj, 'hidden', {
                enumerable: false,
                configurable: true,
                value: true
            });

            return obj;
        };

        expect(Hoek.deepEqual(createObj('a'), createObj('a'))).to.be.true();
        expect(Hoek.deepEqual(createObj('a'), createObj('b'))).to.be.false();
        expect(Hoek.deepEqual(createObj('a'), { value: 'a' }, { prototype: false })).to.be.true();
        expect(Hoek.deepEqual({ value: 'a' }, createObj('a'), { prototype: false })).to.be.true();
        expect(Hoek.deepEqual(createObj('a', 1), { value: 'a', hidden: true }, { prototype: false })).to.be.false();
        expect(Hoek.deepEqual({ value: 'a', hidden: true }, createObj('a', 1), { prototype: false })).to.be.false();
    });

    it('compares an object with property getter while executing it', () => {

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
        expect(Hoek.deepEqual(obj, copy)).to.be.true();
        expect(execCount).to.equal(2);
        expect(copy.test).to.equal(1);
        expect(execCount).to.equal(3);
    });

    it('compares objects with property getters', () => {

        const obj = {};
        Object.defineProperty(obj, 'test', {
            enumerable: true,
            configurable: true,
            get: function () {

                return 1;
            }
        });

        const ref = {};
        Object.defineProperty(ref, 'test', {
            enumerable: true,
            configurable: true,
            get: function () {

                return 2;
            }
        });

        expect(Hoek.deepEqual(obj, ref)).to.be.false();
    });

    it('compares object prototypes', () => {

        const Obj = function () {

            this.a = 5;
        };

        Obj.prototype.b = function () {

            return this.a;
        };

        const Ref = function () {

            this.a = 5;
        };

        Ref.prototype.b = function () {

            return this.a;
        };

        expect(Hoek.deepEqual(new Obj(), new Ref())).to.be.false();
        expect(Hoek.deepEqual(new Obj(), new Obj())).to.be.true();
        expect(Hoek.deepEqual(new Ref(), new Ref())).to.be.true();
    });

    it('compares plain objects', () => {

        const a = Object.create(null);
        const b = Object.create(null);

        a.b = 'c';
        b.b = 'c';

        expect(Hoek.deepEqual(a, b)).to.be.true();
        expect(Hoek.deepEqual(a, { b: 'c' })).to.be.false();
    });

    it('compares an object with an empty object', () => {

        const a = { a: 1, b: 2 };

        expect(Hoek.deepEqual({}, a)).to.be.false();
        expect(Hoek.deepEqual(a, {})).to.be.false();
    });

    it('compares an object ignoring the prototype', () => {

        const a = Object.create(null);
        const b = {};

        expect(Hoek.deepEqual(a, b, { prototype: false })).to.be.true();
    });

    it('compares an object ignoring the prototype recursively', () => {

        const a = [Object.create(null)];
        const b = [{}];

        expect(Hoek.deepEqual(a, b, { prototype: false })).to.be.true();
    });
});

describe('intersect()', () => {

    it('returns the common objects of two arrays', () => {

        const array1 = [1, 2, 3, 4, 4, 5, 5];
        const array2 = [5, 4, 5, 6, 7];
        const common = Hoek.intersect(array1, array2);
        expect(common.length).to.equal(2);
    });

    it('returns just the first common object of two arrays', () => {

        const array1 = [1, 2, 3, 4, 4, 5, 5];
        const array2 = [5, 4, 5, 6, 7];
        const common = Hoek.intersect(array1, array2, true);
        expect(common).to.equal(5);
    });

    it('returns null when no common and returning just the first common object of two arrays', () => {

        const array1 = [1, 2, 3, 4, 4, 5, 5];
        const array2 = [6, 7];
        const common = Hoek.intersect(array1, array2, true);
        expect(common).to.equal(null);
    });

    it('returns an empty array if either input is null', () => {

        expect(Hoek.intersect([1], null).length).to.equal(0);
        expect(Hoek.intersect(null, [1]).length).to.equal(0);
        expect(Hoek.intersect(null, [1], true)).to.be.null();
    });

    it('returns the common objects of object and array', () => {

        const array1 = { 1: true, 2: true, 3: true, 4: true, 5: true };
        const array2 = [5, 4, 5, 6, 7];
        const common = Hoek.intersect(array1, array2);
        expect(common.length).to.equal(2);
    });
});

describe('contain()', () => {

    it('tests strings', () => {

        expect(Hoek.contain('abc', 'ab')).to.be.true();
        expect(Hoek.contain('abc', 'abc', { only: true })).to.be.true();
        expect(Hoek.contain('aaa', 'a', { only: true })).to.be.true();
        expect(Hoek.contain('abc', 'b', { once: true })).to.be.true();
        expect(Hoek.contain('abc', ['a', 'c'])).to.be.true();
        expect(Hoek.contain('abc', ['a', 'd'], { part: true })).to.be.true();

        expect(Hoek.contain('abc', 'ac')).to.be.false();
        expect(Hoek.contain('abcd', 'abc', { only: true })).to.be.false();
        expect(Hoek.contain('aab', 'a', { only: true })).to.be.false();
        expect(Hoek.contain('abb', 'b', { once: true })).to.be.false();
        expect(Hoek.contain('abc', ['a', 'd'])).to.be.false();
        expect(Hoek.contain('abc', ['ab', 'bc'])).to.be.false();                      // Overlapping values not supported
    });

    it('tests arrays', () => {

        expect(Hoek.contain([1, 2, 3], 1)).to.be.true();
        expect(Hoek.contain([{ a: 1 }], { a: 1 }, { deep: true })).to.be.true();
        expect(Hoek.contain([1, 2, 3], [1, 2])).to.be.true();
        expect(Hoek.contain([{ a: 1 }], [{ a: 1 }], { deep: true })).to.be.true();
        expect(Hoek.contain([1, 1, 2], [1, 2], { only: true })).to.be.true();
        expect(Hoek.contain([1, 2], [1, 2], { once: true })).to.be.true();
        expect(Hoek.contain([1, 2, 3], [1, 4], { part: true })).to.be.true();
        expect(Hoek.contain([[1], [2]], [[1]], { deep: true })).to.be.true();
        expect(Hoek.contain([[1, 2]], [[1]], { deep: true, part: true })).to.be.true();
        expect(Hoek.contain([1, 2, 1], [1, 1, 2], { only: true })).to.be.true();
        expect(Hoek.contain([1, 2, 1], [1, 1, 2], { only: true, once: true })).to.be.true();
        expect(Hoek.contain([1, 2, 1], [1, 2, 2], { only: true })).to.be.true();

        expect(Hoek.contain([1, 2, 3], 4)).to.be.false();
        expect(Hoek.contain([{ a: 1 }], { a: 2 }, { deep: true })).to.be.false();
        expect(Hoek.contain([{ a: 1 }], { a: 1 })).to.be.false();
        expect(Hoek.contain([1, 2, 3], [4, 5])).to.be.false();
        expect(Hoek.contain([[3], [2]], [[1]])).to.be.false();
        expect(Hoek.contain([[1], [2]], [[1]])).to.be.false();
        expect(Hoek.contain([[1, 2]], [[1]], { deep: true })).to.be.false();
        expect(Hoek.contain([{ a: 1 }], [{ a: 2 }], { deep: true })).to.be.false();
        expect(Hoek.contain([1, 3, 2], [1, 2], { only: true })).to.be.false();
        expect(Hoek.contain([1, 2, 2], [1, 2], { once: true })).to.be.false();
        expect(Hoek.contain([0, 2, 3], [1, 4], { part: true })).to.be.false();
        expect(Hoek.contain([1, 2, 1], [1, 2, 2], { only: true, once: true })).to.be.false();
        expect(Hoek.contain([1, 2, 1], [1, 2], { only: true, once: true })).to.be.false();
    });

    it('tests objects', () => {

        expect(Hoek.contain({ a: 1, b: 2, c: 3 }, 'a')).to.be.true();
        expect(Hoek.contain({ a: 1, b: 2, c: 3 }, ['a', 'c'])).to.be.true();
        expect(Hoek.contain({ a: 1, b: 2, c: 3 }, ['a', 'b', 'c'], { only: true })).to.be.true();
        expect(Hoek.contain({ a: 1, b: 2, c: 3 }, { a: 1 })).to.be.true();
        expect(Hoek.contain({ a: 1, b: 2, c: 3 }, { a: 1, c: 3 })).to.be.true();
        expect(Hoek.contain({ a: 1, b: 2, c: 3 }, { a: 1, d: 4 }, { part: true })).to.be.true();
        expect(Hoek.contain({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3 }, { only: true })).to.be.true();
        expect(Hoek.contain({ a: [1], b: [2], c: [3] }, { a: [1], c: [3] }, { deep: true })).to.be.true();
        expect(Hoek.contain({ a: [{ b: 1 }, { c: 2 }, { d: 3, e: 4 }] }, { a: [{ b: 1 }, { d: 3 }] }, { deep: true })).to.be.false();
        expect(Hoek.contain({ a: [{ b: 1 }, { c: 2 }, { d: 3, e: 4 }] }, { a: [{ b: 1 }, { d: 3 }] }, { deep: true, part: true })).to.be.true();
        expect(Hoek.contain({ a: [{ b: 1 }, { c: 2 }, { d: 3, e: 4 }] }, { a: [{ b: 1 }, { d: 3 }] }, { deep: true, part: false })).to.be.false();
        expect(Hoek.contain({ a: [{ b: 1 }, { c: 2 }, { d: 3, e: 4 }] }, { a: [{ b: 1 }, { d: 3 }] }, { deep: true, only: true })).to.be.false();
        expect(Hoek.contain({ a: [{ b: 1 }, { c: 2 }, { d: 3, e: 4 }] }, { a: [{ b: 1 }, { d: 3 }] }, { deep: true, only: false })).to.be.true();
        expect(Hoek.contain({ a: [1, 2, 3] }, { a: [2, 4, 6] }, { deep: true, part: true })).to.be.true();

        expect(Hoek.contain({ a: 1, b: 2, c: 3 }, 'd')).to.be.false();
        expect(Hoek.contain({ a: 1, b: 2, c: 3 }, ['a', 'd'])).to.be.false();
        expect(Hoek.contain({ a: 1, b: 2, c: 3, d: 4 }, ['a', 'b', 'c'], { only: true })).to.be.false();
        expect(Hoek.contain({ a: 1, b: 2, c: 3 }, { a: 2 })).to.be.false();
        expect(Hoek.contain({ a: 1, b: 2, c: 3 }, { a: 2, b: 2 }, { part: true })).to.be.false();             // part does not ignore bad value
        expect(Hoek.contain({ a: 1, b: 2, c: 3 }, { a: 1, d: 3 })).to.be.false();
        expect(Hoek.contain({ a: 1, b: 2, c: 3 }, { a: 1, d: 4 })).to.be.false();
        expect(Hoek.contain({ a: 1, b: 2, c: 3 }, { a: 1, b: 2 }, { only: true })).to.be.false();
        expect(Hoek.contain({ a: [1], b: [2], c: [3] }, { a: [1], c: [3] })).to.be.false();
        expect(Hoek.contain({ a: { b: { c: 1, d: 2 } } }, { a: { b: { c: 1 } } })).to.be.false();
        expect(Hoek.contain({ a: { b: { c: 1, d: 2 } } }, { a: { b: { c: 1 } } }, { deep: true })).to.be.false();
        expect(Hoek.contain({ a: { b: { c: 1, d: 2 } } }, { a: { b: { c: 1 } } }, { deep: true, only: true })).to.be.false();
        expect(Hoek.contain({ a: { b: { c: 1, d: 2 } } }, { a: { b: { c: 1 } } }, { deep: true, only: false })).to.be.true();
        expect(Hoek.contain({ a: { b: { c: 1, d: 2 } } }, { a: { b: { c: 1 } } }, { deep: true, part: true })).to.be.true();
        expect(Hoek.contain({ a: { b: { c: 1, d: 2 } } }, { a: { b: { c: 1 } } }, { deep: true, part: false })).to.be.false();
        expect(Hoek.contain({ a: [1, 2, 3] }, { a: [4, 5, 6] }, { deep: true, part: true })).to.be.false();

        // Getter check
        {
            const Foo = function (bar) {

                this.bar = bar;
            };

            const getBar = function () {

                return this.bar;
            };

            const createFoo = (value) => {

                const foo = new Foo(value);
                Object.defineProperty(foo, 'baz', {
                    enumerable: true,
                    get: getBar
                });

                return foo;
            };

            expect(Hoek.contain({ a: createFoo('b') }, { a: createFoo('b') }, { deep: true })).to.be.true();
            expect(Hoek.contain({ a: createFoo('b') }, { a: createFoo('b') }, { deep: true, part: true })).to.be.true();
            expect(Hoek.contain({ a: createFoo('b') }, { a: { bar: 'b', baz: 'b' } }, { deep: true })).to.be.true();
            expect(Hoek.contain({ a: createFoo('b') }, { a: { bar: 'b', baz: 'b' } }, { deep: true, only: true })).to.be.false();
            expect(Hoek.contain({ a: createFoo('b') }, { a: { baz: 'b' } }, { deep: true, part: false })).to.be.false();
            expect(Hoek.contain({ a: createFoo('b') }, { a: { baz: 'b' } }, { deep: true, part: true })).to.be.true();
            expect(Hoek.contain({ a: createFoo('b') }, { a: createFoo('b') }, { deep: true })).to.be.true();
        }

        // Properties on prototype not visible
        {
            const Foo = function () {

                this.a = 1;
            };

            Object.defineProperty(Foo.prototype, 'b', {
                enumerable: true,
                value: 2
            });

            const Bar = function () {

                Foo.call(this);
                this.c = 3;
            };

            Util.inherits(Bar, Foo);

            expect((new Bar()).a).to.equal(1);
            expect((new Bar()).b).to.equal(2);
            expect((new Bar()).c).to.equal(3);
            expect(Hoek.contain(new Bar(), { 'a': 1, 'c': 3 }, { only: true })).to.be.true();
            expect(Hoek.contain(new Bar(), 'b')).to.be.false();
        }

        // Non-Enumerable properties
        {
            const foo = { a: 1, b: 2 };

            Object.defineProperty(foo, 'c', {
                enumerable: false,
                value: 3
            });

            expect(Hoek.contain(foo, 'c')).to.be.true();
            expect(Hoek.contain(foo, { 'c': 3 })).to.be.true();
            expect(Hoek.contain(foo, { 'a': 1, 'b': 2, 'c': 3 }, { only: true })).to.be.true();
        }
    });
});

describe('flatten()', () => {

    it('returns a flat array', () => {

        const result = Hoek.flatten([1, 2, [3, 4, [5, 6], [7], 8], [9], [10, [11, 12]], 13]);
        expect(result.length).to.equal(13);
        expect(result).to.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    });
});

describe('reach()', () => {

    const obj = {
        a: {
            b: {
                c: {
                    d: 1,
                    e: 2
                },
                f: 'hello'
            },
            g: {
                h: 3
            },
            '-2': true
        },
        i: function () { },
        j: null,
        k: [4, 8, 9, 1]
    };

    obj.i.x = 5;

    it('returns object itself', () => {

        expect(Hoek.reach(obj, null)).to.equal(obj);
        expect(Hoek.reach(obj, false)).to.equal(obj);
        expect(Hoek.reach(obj, [])).to.equal(obj);
        expect(Hoek.reach(obj)).to.equal(obj);
    });

    it('returns first value of array', () => {

        expect(Hoek.reach(obj, 'k.0')).to.equal(4);
    });

    it('returns last value of array using negative index', () => {

        expect(Hoek.reach(obj, 'k.-2')).to.equal(9);
    });

    it('returns object property with negative index for non-array', () => {

        expect(Hoek.reach(obj, 'a.-2')).to.be.equal(true);
    });

    it('returns a valid member', () => {

        expect(Hoek.reach(obj, 'a.b.c.d')).to.equal(1);
    });

    it('returns a valid member with separator override', () => {

        expect(Hoek.reach(obj, 'a/b/c/d', '/')).to.equal(1);
    });

    it('returns a valid member with path array', () => {

        expect(Hoek.reach(obj, ['a', 'b', 'c', 'd'])).to.equal(1);
    });

    it('throws on path array with seperator override', () => {

        expect(() => {

            Hoek.reach(obj, ['a', 'b', 'c', 'd'], { seperator: '-' });
        }).to.throw('Invalid arguments: cannot use seperator option with path array');

    });

    it('returns undefined on null object', () => {

        expect(Hoek.reach(null, 'a.b.c.d')).to.equal(undefined);
    });

    it('returns undefined on missing object member', () => {

        expect(Hoek.reach(obj, 'a.b.c.d.x')).to.equal(undefined);
    });

    it('returns undefined on missing function member', () => {

        expect(Hoek.reach(obj, 'i.y', { functions: true })).to.equal(undefined);
    });

    it('throws on missing member in strict mode', () => {

        expect(() => {

            Hoek.reach(obj, 'a.b.c.o.x', { strict: true });
        }).to.throw('Missing segment o in reach path  a.b.c.o.x');

    });

    it('returns undefined on invalid member', () => {

        expect(Hoek.reach(obj, 'a.b.c.d-.x')).to.equal(undefined);
    });

    it('returns function member', () => {

        expect(typeof Hoek.reach(obj, 'i')).to.equal('function');
    });

    it('returns function property', () => {

        expect(Hoek.reach(obj, 'i.x')).to.equal(5);
    });

    it('returns null', () => {

        expect(Hoek.reach(obj, 'j')).to.equal(null);
    });

    it('throws on function property when functions not allowed', () => {

        expect(() => {

            Hoek.reach(obj, 'i.x', { functions: false });
        }).to.throw('Invalid segment x in reach path  i.x');
    });

    it('will return a default value if property is not found', () => {

        expect(Hoek.reach(obj, 'a.b.q', { default: 'defaultValue' })).to.equal('defaultValue');
    });

    it('will return a default value if path is not found', () => {

        expect(Hoek.reach(obj, 'q', { default: 'defaultValue' })).to.equal('defaultValue');
    });

    it('allows a falsey value to be used as the default value', () => {

        expect(Hoek.reach(obj, 'q', { default: '' })).to.equal('');
    });
});

describe('reachTemplate()', () => {

    it('applies object to template', () => {

        const obj = {
            a: {
                b: {
                    c: {
                        d: 1
                    }
                }
            },
            j: null,
            k: [4, 8, 9, 1]
        };

        const template = '{k.0}:{k.-2}:{a.b.c.d}:{x.y}:{j}';

        expect(Hoek.reachTemplate(obj, template)).to.equal('4:9:1::');
    });

    it('applies object to template (options)', () => {

        const obj = {
            a: {
                b: {
                    c: {
                        d: 1
                    }
                }
            },
            j: null,
            k: [4, 8, 9, 1]
        };

        const template = '{k/0}:{k/-2}:{a/b/c/d}:{x/y}:{j}';

        expect(Hoek.reachTemplate(obj, template, '/')).to.equal('4:9:1::');
    });
});

describe('assert()', () => {

    it('throws an Error when using assert in a test', () => {

        expect(() => {

            Hoek.assert(false, 'my error message');
        }).to.throw('my error message');
    });

    it('throws an Error when using assert in a test with no message', () => {

        expect(() => {

            Hoek.assert(false);
        }).to.throw('Unknown error');
    });

    it('throws an Error when using assert in a test with multipart message', () => {

        expect(() => {

            Hoek.assert(false, 'This', 'is', 'my message');
        }).to.throw('This is my message');
    });

    it('throws an Error when using assert in a test with multipart message (empty)', () => {

        expect(() => {

            Hoek.assert(false, 'This', 'is', '', 'my message');
        }).to.throw('This is my message');
    });

    it('throws an Error when using assert in a test with object message', () => {

        expect(() => {

            Hoek.assert(false, 'This', 'is', { spinal: 'tap' });
        }).to.throw('This is {"spinal":"tap"}');
    });

    it('throws an Error when using assert in a test with multipart string and error messages', () => {

        expect(() => {

            Hoek.assert(false, 'This', 'is', new Error('spinal'), new Error('tap'));
        }).to.throw('This is spinal tap');
    });

    it('throws an Error when using assert in a test with error object message', () => {

        expect(() => {

            Hoek.assert(false, new Error('This is spinal tap'));
        }).to.throw('This is spinal tap');
    });

    it('throws the same Error that is passed to it if there is only one error passed', () => {

        const error = new Error('ruh roh');
        const error2 = new Error('ruh roh');

        const fn = function () {

            Hoek.assert(false, error);
        };

        try {
            fn();
        }
        catch (err) {
            expect(err).to.equal(error);  // should be the same reference
            expect(err).to.not.shallow.equal(error2); // error with the same message should not match
        }
    });
});

describe('Bench', () => {

    it('returns time elapsed', async () => {

        const timer = new Hoek.Bench();
        await Hoek.wait(12);
        expect(timer.elapsed()).to.be.above(9);
    });
});

describe('escapeRegex()', () => {

    it('escapes all special regular expression characters', () => {

        const a = Hoek.escapeRegex('4^f$s.4*5+-_?%=#!:@|~\\/`"(>)[<]d{}s,');
        expect(a).to.equal('4\\^f\\$s\\.4\\*5\\+\\-_\\?%\\=#\\!\\:@\\|~\\\\\\/`"\\(>\\)\\[<\\]d\\{\\}s\\,');
    });
});

describe('escapeHeaderAttribute()', () => {

    it('should not alter ascii values', () => {

        const a = Hoek.escapeHeaderAttribute('My Value');
        expect(a).to.equal('My Value');
    });

    it('escapes all special HTTP header attribute characters', () => {

        const a = Hoek.escapeHeaderAttribute('I said go!!!#"' + String.fromCharCode(92));
        expect(a).to.equal('I said go!!!#\\"\\\\');
    });

    it('throws on large unicode characters', () => {

        expect(() => {

            Hoek.escapeHeaderAttribute('this is a test' + String.fromCharCode(500) + String.fromCharCode(300));
        }).to.throw(Error);
    });

    it('throws on CRLF to prevent response splitting', () => {

        expect(() => {

            Hoek.escapeHeaderAttribute('this is a test\r\n');
        }).to.throw(Error);
    });
});

describe('escapeHtml()', () => {

    it('escapes all special HTML characters', () => {

        const a = Hoek.escapeHtml('&<>"\'`');
        expect(a).to.equal('&amp;&lt;&gt;&quot;&#x27;&#x60;');
    });

    it('returns empty string on falsy input', () => {

        const a = Hoek.escapeHtml('');
        expect(a).to.equal('');
    });

    it('returns unchanged string on no reserved input', () => {

        const a = Hoek.escapeHtml('abc');
        expect(a).to.equal('abc');
    });
});

describe('once()', () => {

    it('allows function to only execute once', () => {

        let gen = 0;
        let add = function (x) {

            gen += x;
        };

        add(5);
        expect(gen).to.equal(5);
        add = Hoek.once(add);
        add(5);
        expect(gen).to.equal(10);
        add(5);
        expect(gen).to.equal(10);
    });

    it('double once wraps one time', () => {

        let method = function () { };
        method = Hoek.once(method);
        method.x = 1;
        method = Hoek.once(method);
        expect(method.x).to.equal(1);
    });
});

describe('ignore()', () => {

    it('exists', () => {

        expect(Hoek.ignore).to.exist();
        expect(typeof Hoek.ignore).to.equal('function');
    });
});

describe('uniqueFilename()', () => {

    it('generates a random file path', () => {

        const result = Hoek.uniqueFilename('./test/modules');

        expect(result).to.exist();
        expect(result).to.be.a.string();
        expect(result).to.contain(`test${Path.sep}modules`);
    });

    it('is random enough to use in fast loops', () => {

        const results = [];

        for (let i = 0; i < 10; ++i) {
            results[i] = Hoek.uniqueFilename('./test/modules');
        }

        const filter = results.filter((item, index, array) => {

            return array.indexOf(item) === index;
        });

        expect(filter.length).to.equal(10);
        expect(results.length).to.equal(10);
    });

    it('combines the random elements with a supplied character', () => {

        const result = Hoek.uniqueFilename('./test', 'txt');

        expect(result).to.contain(`test${Path.sep}`);
        expect(result).to.contain('.txt');
    });

    it('accepts extensions with a "." in it', () => {

        const result = Hoek.uniqueFilename('./test', '.mp3');

        expect(result).to.contain(`test${Path.sep}`);
        expect(result).to.contain('.mp3');
    });
});

describe('stringify()', () => {

    it('converts object to string', () => {

        const obj = { a: 1 };
        expect(Hoek.stringify(obj)).to.equal('{"a":1}');
    });

    it('returns error in result string', () => {

        const obj = { a: 1 };
        obj.b = obj;
        expect(Hoek.stringify(obj)).to.equal('[Cannot display object: Converting circular structure to JSON]');
    });
});

describe('block()', () => {

    it('executes ignore function', async () => {

        const orig = Hoek.ignore;
        Hoek.ignore = (resolve) => resolve();
        await Hoek.block();
        Hoek.ignore = orig;
    });
});
