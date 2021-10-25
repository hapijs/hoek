'use strict';

const Util = require('util');

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


describe('merge()', () => {

    it('deep copies source items', () => {

        const sym1 = Symbol('1');
        const sym2 = Symbol('2');
        const sym3 = Symbol('3');

        const target = {
            b: 3,
            d: [],
            [sym1]: true,
            [sym3]: true
        };

        const source = {
            c: {
                d: 1
            },
            d: [{ e: 1 }],
            [sym2]: true,
            [sym3]: false
        };

        Hoek.merge(target, source);
        expect(target.c).to.not.shallow.equal(source.c);
        expect(target.c).to.equal(source.c);
        expect(target.d).to.not.shallow.equal(source.d);
        expect(target.d[0]).to.not.shallow.equal(source.d[0]);
        expect(target.d).to.equal(source.d);

        expect(target[sym1]).to.be.true();
        expect(target[sym2]).to.be.true();
        expect(target[sym3]).to.be.false();
    });

    it('deep copies source items without symbols', () => {

        const sym1 = Symbol('1');
        const sym2 = Symbol('2');
        const sym3 = Symbol('3');

        const target = {
            b: 3,
            d: [],
            [sym1]: true,
            [sym3]: true
        };

        const source = {
            c: {
                d: 1
            },
            d: [{ e: 1 }],
            [sym2]: true,
            [sym3]: false
        };

        Hoek.merge(target, source, { symbols: false });
        expect(target.c).to.not.shallow.equal(source.c);
        expect(target.c).to.equal(source.c);
        expect(target.d).to.not.shallow.equal(source.d);
        expect(target.d[0]).to.not.shallow.equal(source.d[0]);
        expect(target.d).to.equal(source.d);

        expect(target[sym1]).to.be.true();
        expect(target[sym2]).to.not.exist();
        expect(target[sym3]).to.be.true();
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

        const a = { x: 1, y: 2, z: 3, v: 5, t: 'test', s: 1, m: 'abc' };
        const b = { x: null, z: 4, v: 0, t: { u: 6 }, s: undefined, m: '123' };

        const c = Hoek.merge(a, b);
        expect(c.x).to.equal(null);
        expect(c.y).to.equal(2);
        expect(c.z).to.equal(4);
        expect(c.v).to.equal(0);
        expect(c.m).to.equal('123');
        expect(c.t).to.equal({ u: 6 });
        expect(c.s).to.equal(undefined);
    });

    it('overrides values in target (flip)', () => {

        const a = { x: 1, y: 2, z: 3, v: 5, t: 'test', s: 1, m: 'abc' };
        const b = { x: null, z: 4, v: 0, t: { u: 6 }, s: undefined, m: '123' };

        const d = Hoek.merge(b, a);
        expect(d.x).to.equal(1);
        expect(d.y).to.equal(2);
        expect(d.z).to.equal(3);
        expect(d.v).to.equal(5);
        expect(d.m).to.equal('abc');
        expect(d.t).to.equal('test');
        expect(d.s).to.equal(1);
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

    it('overrides Symbol properties', () => {

        const sym = Symbol();
        const a = { [sym]: 1 };

        Hoek.merge({ [sym]: {} }, a);
        expect(a[sym]).to.equal(1);
    });

    it('skips __proto__', () => {

        const a = '{ "ok": "value", "__proto__": { "test": "value" } }';

        const b = Hoek.merge({}, JSON.parse(a));
        expect(b).to.equal({ ok: 'value' });
        expect(b.test).to.equal(undefined);
    });
});

describe('applyToDefaults()', () => {

    it('throws when target is null', () => {

        expect(() => {

            Hoek.applyToDefaults(null, {});
        }).to.throw('Invalid defaults value: must be an object');
    });

    it('throws when options are invalid', () => {

        expect(() => {

            Hoek.applyToDefaults({}, {}, false);
        }).to.throw('Invalid options: must be an object');

        expect(() => {

            Hoek.applyToDefaults({}, {}, 123);
        }).to.throw('Invalid options: must be an object');
    });

    it('returns null if source is false', () => {

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

        const result = Hoek.applyToDefaults(defaults, false);
        expect(result).to.equal(null);
    });

    it('returns null if source is null', () => {

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

        const result = Hoek.applyToDefaults(defaults, null);
        expect(result).to.equal(null);
    });

    it('returns null if source is undefined', () => {

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

        const result = Hoek.applyToDefaults(defaults, undefined);
        expect(result).to.equal(null);
    });

    it('returns a copy of defaults if source is true', () => {

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

        const result = Hoek.applyToDefaults(defaults, true);
        expect(result).to.equal(defaults);
    });

    it('applies object to defaults', () => {

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

        const result = Hoek.applyToDefaults(defaults, obj, { nullOverride: true });
        expect(result.c.e).to.equal([4]);
        expect(result.a).to.equal(null);
        expect(result.b).to.equal(2);
        expect(result.f).to.equal(0);
        expect(result.g).to.equal({ h: 5 });
    });

    it('shallow copies the listed keys from source without merging', () => {

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

        const source = {
            a: {
                b: 4
            },
            c: {
                d: 6,
                f: 7
            }
        };

        const merged = Hoek.applyToDefaults(defaults, source, { shallow: ['a'] });
        expect(merged).to.equal({ a: { b: 4 }, c: { d: 6, g: 1, f: 7 } });
        expect(merged.a).to.shallow.equal(source.a);
        expect(merged.a).to.not.equal(defaults.a);
        expect(merged.c).to.not.equal(source.c);
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

        const source = {
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

        const merged = Hoek.applyToDefaults(defaults, source, { shallow: ['c.g'] });
        expect(merged).to.equal({ a: { b: 4 }, c: { d: 6, g: { h: 8 } } });
        expect(merged.c.g).to.shallow.equal(source.c.g);
    });

    it('shallow copies the nested keys (missing)', () => {

        const defaults = {
            a: {
                b: 5
            }
        };

        const source = {
            a: {
                b: 4
            },
            c: {
                g: {
                    h: 8
                }
            }
        };

        const merged = Hoek.applyToDefaults(defaults, source, { shallow: ['c.g'] });
        expect(merged).to.equal({ a: { b: 4 }, c: { g: { h: 8 } } });
        expect(merged.c.g).to.shallow.equal(source.c.g);
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

        const source = {
            a: {
                b: 4
            },
            c: {
                g: {
                    h: 8
                }
            }
        };

        const merged = Hoek.applyToDefaults(defaults, source, { shallow: ['c.g'] });
        expect(merged).to.equal({ a: { b: 4 }, c: { g: { h: 8 } } });
        expect(merged.c.g).to.shallow.equal(source.c.g);
    });

    it('shallow copies the nested keys (deeper)', () => {

        const defaults = {
            a: {
                b: 5
            }
        };

        const source = {
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

        const merged = Hoek.applyToDefaults(defaults, source, { shallow: ['c.g.r'] });
        expect(merged).to.equal({ a: { b: 4 }, c: { g: { r: { h: 8 } } } });
        expect(merged.c.g.r).to.shallow.equal(source.c.g.r);
    });

    it('shallow copies the nested keys (not present)', () => {

        const defaults = {
            a: {
                b: 5
            }
        };

        const source = {
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

        const merged = Hoek.applyToDefaults(defaults, source, { shallow: ['x.y'] });
        expect(merged).to.equal({ a: { b: 4 }, c: { g: { r: { h: 8 } } } });
    });

    it('shallow copies the nested keys (non-object)', () => {

        const defaults = {
            // All falsy values:
            _undefined: {
                a: 1
            },
            _null: {
                a: 2
            },
            _false: {
                a: 3
            },
            _emptyString: {
                a: 4
            },
            _zero: {
                a: 5
            },
            _NaN: {
                a: 6
            },
            // Other non-object values:
            _string: {
                a: 7
            },
            _number: {
                a: 8
            },
            _true: {
                a: 9
            },
            _function: {
                a: 10
            }
        };

        const source = {
            _undefined: undefined,
            _null: null,
            _false: false,
            _emptyString: '',
            _zero: 0,
            _NaN: NaN,
            _string: 'foo',
            _number: 42,
            _true: true,
            _function: () => {}
        };

        const merged = Hoek.applyToDefaults(defaults, source, { shallow: [
            '_undefined.a',
            '_null.a',
            '_false.a',
            '_emptyString.a',
            '_zero.a',
            '_NaN.a',
            '_string.a',
            '_number.a',
            '_true.a',
            '_function.a'
        ] });
        expect(merged).to.equal({
            _undefined: { a: 1 },
            _null: { a: 2 },
            _false: false,
            _emptyString: '',
            _zero: 0,
            _NaN: NaN,
            _string: 'foo',
            _number: 42,
            _true: true,
            _function: source._function
        });
    });

    it('shallow copies the listed keys in the defaults', () => {

        const defaults = {
            a: {
                b: 1
            }
        };

        const merged = Hoek.applyToDefaults(defaults, {}, { shallow: ['a'] });
        expect(merged.a).to.shallow.equal(defaults.a);
    });

    it('shallow copies the listed keys in the defaults (true)', () => {

        const defaults = {
            a: {
                b: 1
            }
        };

        const merged = Hoek.applyToDefaults(defaults, true, { shallow: ['a'] });
        expect(merged.a).to.shallow.equal(defaults.a);
    });

    it('returns null on false', () => {

        const defaults = {
            a: {
                b: 1
            }
        };

        const merged = Hoek.applyToDefaults(defaults, false, { shallow: ['a'] });
        expect(merged).to.equal(null);
    });

    it('handles missing shallow key in defaults', () => {

        const defaults = {
            a: {
                b: 1
            }
        };

        const options = {
            a: {
                b: 4
            },
            c: {
                d: 2
            }
        };

        const merged = Hoek.applyToDefaults(defaults, options, { shallow: ['c'] });
        expect(merged).to.equal({ a: { b: 4 }, c: { d: 2 } });
        expect(merged.c).to.shallow.equal(options.c);

        expect(Hoek.applyToDefaults(defaults, true, { shallow: ['c'] })).to.equal({ a: { b: 1 } });
    });

    it('throws on missing defaults', () => {

        expect(() => Hoek.applyToDefaults(null, {}, { shallow: ['a'] })).to.throw('Invalid defaults value: must be an object');
    });

    it('throws on invalid defaults', () => {

        expect(() => Hoek.applyToDefaults('abc', {}, { shallow: ['a'] })).to.throw('Invalid defaults value: must be an object');
    });

    it('throws on invalid source', () => {

        expect(() => Hoek.applyToDefaults({}, 'abc', { shallow: ['a'] })).to.throw('Invalid source value: must be true, falsy or an object');
    });

    it('throws on missing keys', () => {

        expect(() => Hoek.applyToDefaults({}, true, { shallow: 123 })).to.throw('Invalid keys');
    });

    it('handles array keys', () => {

        const sym = Symbol();

        const defaults = {
            a: {
                b: 5,
                e: 3
            },
            c: {
                d: 7,
                [sym]: {
                    f: 9
                }
            }
        };

        const options = {
            a: {
                b: 4
            },
            c: {
                d: 6,
                [sym]: {
                    g: 1
                }
            }
        };

        const merged = Hoek.applyToDefaults(defaults, options, { shallow: [['c', sym]] });
        expect(merged).to.equal({ a: { b: 4, e: 3 }, c: { d: 6, [sym]: { g: 1 } } });
        expect(merged.c[sym]).to.shallow.equal(options.c[sym]);
    });

    it('does not modify shallow entries in source', () => {

        const defaults = {
            a: {
                b: 5
            }
        };

        const source = {};

        Object.defineProperty(source, 'a', { value: { b: 4 } });

        const merged = Hoek.applyToDefaults(defaults, source, { shallow: ['a'] });
        expect(merged).to.equal({ a: { b: 4 } });
        expect(merged.a).to.shallow.equal(source.a);
        expect(merged.a).to.not.equal(defaults.a);
    });

    it('should respect nullOverride when shallow is used', () => {

        const defaults = { host: 'localhost', port: 8000 };
        const source = { host: null, port: 8080 };

        const result = Hoek.applyToDefaults(defaults, source, { nullOverride: true, shallow: [] });
        expect(result.host).to.equal(null);
        expect(result.port).to.equal(8080);
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

    it('compares symbol object properties', () => {

        const sym = Symbol();

        const ne = {};
        Object.defineProperty(ne, sym, { value: true });

        expect(Hoek.deepEqual({ [sym]: { c: true } }, { [sym]: { c: true } })).to.be.true();
        expect(Hoek.deepEqual({ [sym]: { c: true } }, { [sym]: { c: false } })).to.be.false();
        expect(Hoek.deepEqual({ [sym]: { c: true } }, { [sym]: true })).to.be.false();
        expect(Hoek.deepEqual({ [sym]: undefined }, { [sym]: undefined })).to.be.true();
        expect(Hoek.deepEqual({ [sym]: undefined }, {})).to.be.false();
        expect(Hoek.deepEqual({}, { [sym]: undefined })).to.be.false();

        expect(Hoek.deepEqual({}, ne)).to.be.true();
        expect(Hoek.deepEqual(ne, {})).to.be.true();
        expect(Hoek.deepEqual({ [sym]: true }, ne)).to.be.false();
        expect(Hoek.deepEqual(ne, { [sym]: true })).to.be.false();
        expect(Hoek.deepEqual(ne, { [Symbol()]: undefined })).to.be.false();

        expect(Hoek.deepEqual({ [sym]: true }, { [sym]: true })).to.be.true();
        expect(Hoek.deepEqual({ [sym]: true }, {})).to.be.false();
        expect(Hoek.deepEqual({ [sym]: true }, {}, { symbols: false })).to.be.true();
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

        expect(Hoek.deepEqual(new Error('a'), new TypeError('a'))).to.be.false();
        expect(Hoek.deepEqual(new Error('a'), new TypeError('a'), { prototype: false })).to.be.false();

        expect(Hoek.deepEqual(new Error(), {})).to.be.false();
        expect(Hoek.deepEqual(new Error(), {}, { prototype: false })).to.be.false();

        expect(Hoek.deepEqual({}, new Error())).to.be.false();
        expect(Hoek.deepEqual({}, new Error(), { prototype: false })).to.be.false();

        const error = new Error('a');
        expect(Hoek.deepEqual(Hoek.clone(error), error)).to.be.true();
        expect(Hoek.deepEqual(Hoek.clone(error), error, { prototype: false })).to.be.true();
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

    it('compares extended sets', () => {

        class PrivateSet extends Set {

            has() {

                throw new Error('not allowed');
            }
        }

        const entries = ['a', undefined];
        expect(Hoek.deepEqual(new PrivateSet(), new PrivateSet())).to.be.true();
        expect(Hoek.deepEqual(new PrivateSet(entries), new PrivateSet(entries))).to.be.true();
        expect(Hoek.deepEqual(new PrivateSet(entries), new Set(entries), { prototype: false })).to.be.true();
        expect(Hoek.deepEqual(new PrivateSet(entries), new Set(entries), { prototype: true })).to.be.false();
        expect(Hoek.deepEqual(new PrivateSet(), new PrivateSet(entries))).to.be.false();
        expect(Hoek.deepEqual(new PrivateSet(entries), new PrivateSet())).to.be.false();

        class LockableSet extends Set {

            constructor(values, locked = true) {

                super(values);
                this.locked = locked;
            }

            has() {

                if (this.locked) {
                    throw new Error('not allowed');
                }
            }
        }

        expect(Hoek.deepEqual(new LockableSet(), new LockableSet())).to.be.true();
        expect(Hoek.deepEqual(new LockableSet(entries), new LockableSet(entries))).to.be.true();
        expect(Hoek.deepEqual(new LockableSet(entries, false), new LockableSet(entries, false))).to.be.true();
        expect(Hoek.deepEqual(new LockableSet(entries, true), new LockableSet(entries, false))).to.be.false();
        expect(Hoek.deepEqual(new LockableSet(entries, false), new LockableSet(entries, true))).to.be.false();
        expect(Hoek.deepEqual(new LockableSet(entries), new Set(entries), { prototype: false })).to.be.false();
        expect(Hoek.deepEqual(new LockableSet(entries), new PrivateSet(entries), { prototype: false })).to.be.false();
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

    it('compares extended maps', () => {

        class PrivateMap extends Map {

            get() {

                throw new Error('not allowed');
            }
        }

        const entries = [['a', 1], ['b', undefined]];
        expect(Hoek.deepEqual(new PrivateMap(), new PrivateMap())).to.be.true();
        expect(Hoek.deepEqual(new PrivateMap(entries), new PrivateMap(entries))).to.be.true();
        expect(Hoek.deepEqual(new PrivateMap(entries), new Map(entries), { prototype: false })).to.be.true();
        expect(Hoek.deepEqual(new PrivateMap(entries), new Map(entries), { prototype: true })).to.be.false();
        expect(Hoek.deepEqual(new PrivateMap(), new PrivateMap(entries))).to.be.false();
        expect(Hoek.deepEqual(new PrivateMap(entries), new PrivateMap())).to.be.false();

        class LockableMap extends Map {

            constructor(kvs, locked = true) {

                super(kvs);
                this.locked = locked;
            }

            get() {

                if (this.locked) {
                    throw new Error('not allowed');
                }
            }
        }

        expect(Hoek.deepEqual(new LockableMap(), new LockableMap())).to.be.true();
        expect(Hoek.deepEqual(new LockableMap(entries), new LockableMap(entries))).to.be.true();
        expect(Hoek.deepEqual(new LockableMap(entries, false), new LockableMap(entries, false))).to.be.true();
        expect(Hoek.deepEqual(new LockableMap(entries, true), new LockableMap(entries, false))).to.be.false();
        expect(Hoek.deepEqual(new LockableMap(entries, false), new LockableMap(entries, true))).to.be.false();
        expect(Hoek.deepEqual(new LockableMap(entries), new Map(entries), { prototype: false })).to.be.false();
        expect(Hoek.deepEqual(new LockableMap(entries), new PrivateMap(entries), { prototype: false })).to.be.false();
    });

    it('compares promises', () => {

        const a = new Promise(() => { });

        expect(Hoek.deepEqual(a, a)).to.be.true();
        expect(Hoek.deepEqual(a, new Promise(() => { }))).to.be.false();
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

    it('compares functions', () => {

        const f1 = () => 1;
        const f2 = () => 2;
        const f2a = () => 2;

        expect(Hoek.deepEqual({ f1 }, { f1 })).to.be.true();
        expect(Hoek.deepEqual({ f1 }, { f1: f2 })).to.be.false();
        expect(Hoek.deepEqual({ f2 }, { f2: f2a })).to.be.false();
        expect(Hoek.deepEqual({ f2 }, { f2: f2a }, { deepFunction: true })).to.be.true();
        expect(Hoek.deepEqual({ f2 }, { f2: f1 }, { deepFunction: true })).to.be.false();

        const f3 = () => 3;
        f3.x = 1;

        const f3a = () => 3;
        f3a.x = 1;

        const f3b = () => 3;
        f3b.x = 2;

        expect(Hoek.deepEqual({ f3 }, { f3: f3a }, { deepFunction: true })).to.be.true();
        expect(Hoek.deepEqual({ f3 }, { f3: f3b }, { deepFunction: true })).to.be.false();
    });

    it('skips keys', () => {

        expect(Hoek.deepEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 4 })).to.be.false();
        expect(Hoek.deepEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 4 }, { skip: ['c'] })).to.be.true();

        expect(Hoek.deepEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2 })).to.be.false();
        expect(Hoek.deepEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2 }, { skip: ['c'] })).to.be.true();

        const sym = Symbol('test');
        expect(Hoek.deepEqual({ a: 1, b: 2, [sym]: 3 }, { a: 1, b: 2, [sym]: 4 })).to.be.false();
        expect(Hoek.deepEqual({ a: 1, b: 2, [sym]: 3 }, { a: 1, b: 2, [sym]: 4 }, { skip: [sym] })).to.be.true();

        expect(Hoek.deepEqual({ a: 1, b: 2, [sym]: 3 }, { a: 1, b: 2 })).to.be.false();
        expect(Hoek.deepEqual({ a: 1, b: 2, [sym]: 3 }, { a: 1, b: 2 }, { skip: [sym] })).to.be.true();
        expect(Hoek.deepEqual({ a: 1, b: 2, [sym]: 3, [Symbol('other')]: true }, { a: 1, b: 2 }, { skip: [sym] })).to.be.false();

        expect(Hoek.deepEqual({ a: 1, b: 2 }, { a: 1 }, { skip: ['a'] })).to.be.false();
        expect(Hoek.deepEqual({ a: 1 }, { a: 1, b: 2 }, { skip: ['a'] })).to.be.false();
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

        const throwing = class {

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
        expect(common).to.equal([5, 4]);
    });

    it('returns the common objects of array and set', () => {

        const array1 = new Set([1, 2, 3, 4, 4, 5, 5]);
        const array2 = [5, 4, 5, 6, 7];
        const common = Hoek.intersect(array1, array2);
        expect(common).to.equal([5, 4]);
    });

    it('returns the common objects of set and array', () => {

        const array1 = [1, 2, 3, 4, 4, 5, 5];
        const array2 = new Set([5, 4, 5, 6, 7]);
        const common = Hoek.intersect(array1, array2);
        expect(common).to.equal([5, 4]);
    });

    it('returns the common objects of two sets', () => {

        const array1 = new Set([1, 2, 3, 4, 4, 5, 5]);
        const array2 = new Set([5, 4, 5, 6, 7]);
        const common = Hoek.intersect(array1, array2);
        expect(common).to.equal([5, 4]);
    });

    it('returns just the first common object of two arrays', () => {

        const array1 = [1, 2, 3, 4, 4, 5, 5];
        const array2 = [5, 4, 5, 6, 7];
        const common = Hoek.intersect(array1, array2, { first: true });
        expect(common).to.equal(5);
    });

    it('returns null when no common and returning just the first common object of two arrays', () => {

        const array1 = [1, 2, 3, 4, 4, 5, 5];
        const array2 = [6, 7];
        const common = Hoek.intersect(array1, array2, { first: true });
        expect(common).to.equal(null);
    });

    it('returns an empty array if either input is null', () => {

        expect(Hoek.intersect([1], null).length).to.equal(0);
        expect(Hoek.intersect(null, [1]).length).to.equal(0);
        expect(Hoek.intersect(null, [1], { first: true })).to.be.null();
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
        expect(Hoek.contain('aaa', 'a', { only: true, once: true })).to.be.false();
        expect(Hoek.contain('abc', 'b', { once: true })).to.be.true();
        expect(Hoek.contain('abc', ['a', 'c'])).to.be.true();
        expect(Hoek.contain('abc', ['a', 'd'], { part: true })).to.be.true();
        expect(Hoek.contain('aaa', ['a', 'a'], { only: true, once: true })).to.be.false();
        expect(Hoek.contain('aaa', ['a', 'a'], { only: true })).to.be.true();
        expect(Hoek.contain('aaa', ['a', 'a', 'a'], { only: true, once: true })).to.be.true();

        expect(Hoek.contain('abc', 'ac')).to.be.false();
        expect(Hoek.contain('abcd', 'abc', { only: true })).to.be.false();
        expect(Hoek.contain('aab', 'a', { only: true })).to.be.false();
        expect(Hoek.contain('abb', 'b', { once: true })).to.be.false();
        expect(Hoek.contain('abc', ['a', 'd'])).to.be.false();
        expect(Hoek.contain('abc', ['ab', 'bc'])).to.be.false();                      // Overlapping values not supported

        expect(Hoek.contain('', 'a')).to.be.false();
        expect(Hoek.contain('', 'a', { only: true })).to.be.false();

        expect(Hoek.contain('', '')).to.be.true();
        expect(Hoek.contain('', ''), { only: true }).to.be.true();
        expect(Hoek.contain('', ''), { once: true }).to.be.true();
        expect(Hoek.contain('', ['', ''])).to.be.true();
        expect(Hoek.contain('', ['', ''], { only: true })).to.be.true();
        expect(Hoek.contain('', ['', ''], { once: true })).to.be.false();

        expect(Hoek.contain('a', '')).to.be.true();
        expect(Hoek.contain('a', '', { only: true })).to.be.false();
        expect(Hoek.contain('a', '', { once: true })).to.be.false();
        expect(Hoek.contain('a', ['', ''])).to.be.true();
        expect(Hoek.contain('a', ['', ''], { only: true })).to.be.false();
        expect(Hoek.contain('a', ['', ''], { once: true })).to.be.false();

        expect(Hoek.contain('ab', ['a', 'b', 'c'])).to.be.false();
        expect(Hoek.contain('ab', ['a', 'b', 'c'], { only: true })).to.be.false();
        expect(Hoek.contain('ab', ['a', 'b', 'c'], { only: true, once: true })).to.be.false();

        expect(Hoek.contain('ab', ['c'], { part: true })).to.be.false();
        expect(Hoek.contain('ab', ['b'], { part: true })).to.be.true();
    });

    it('tests arrays', () => {

        expect(Hoek.contain([1, 2, 3], 1)).to.be.true();
        expect(Hoek.contain([{ a: 1 }], { a: 1 }, { deep: true })).to.be.true();
        expect(Hoek.contain([1, 2, 3], [1, 2])).to.be.true();
        expect(Hoek.contain([{ a: 1 }], [{ a: 1 }], { deep: true })).to.be.true();
        expect(Hoek.contain([1, 1, 2], [1, 2], { only: true })).to.be.true();
        expect(Hoek.contain([1, 2], [1, 2], { once: true })).to.be.true();
        expect(Hoek.contain([1, 2, 3], [1, 4], { part: true })).to.be.true();
        expect(Hoek.contain([null, 2, 3], [null, 4], { part: true })).to.be.true();
        expect(Hoek.contain([null], null, { deep: true })).to.be.true();
        expect(Hoek.contain([[1], [2]], [[1]], { deep: true })).to.be.true();
        expect(Hoek.contain([[1], [2], 3], [[1]], { deep: true })).to.be.true();
        expect(Hoek.contain([[1, 2]], [[1]], { deep: true, part: true })).to.be.true();
        expect(Hoek.contain([[1, 2]], [[1], 2], { deep: true, part: true })).to.be.true();
        expect(Hoek.contain([1, 2, 1], [1, 1, 2], { only: true })).to.be.true();
        expect(Hoek.contain([1, 2, 1], [1, 1, 2], { only: true, once: true })).to.be.true();
        expect(Hoek.contain([1, 2, 1], [1, 2, 2], { only: true })).to.be.false();
        expect(Hoek.contain([1, 2, 1], [1, 2, 2], { only: true, part: true })).to.be.true();
        expect(Hoek.contain([1, 1, 1], [1, 1, 1, 1])).to.be.false();
        expect(Hoek.contain([1, 1, 1], [1, 1, 1, 1], { part: true })).to.be.true();

        expect(Hoek.contain([1, 2, 3], 4)).to.be.false();
        expect(Hoek.contain([{ a: 1 }], { a: 2 }, { deep: true })).to.be.false();
        expect(Hoek.contain([{ a: 1 }, { a: 1 }], [{ a: 1 }, { a: 1 }], { deep: true, once: true, only: true })).to.be.true();
        expect(Hoek.contain([{ a: 1 }, { a: 1 }], [{ a: 1 }, { a: 2 }], { deep: true, once: true, only: true })).to.be.false();
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

        expect(Hoek.contain([], 1)).to.be.false();
        expect(Hoek.contain([], 1, { only: true })).to.be.false();

        expect(Hoek.contain(['a', 'b'], ['a', 'b', 'c'])).to.be.false();
        expect(Hoek.contain(['a', 'b'], ['a', 'b', 'c'], { only: true })).to.be.false();
        expect(Hoek.contain(['a', 'b'], ['a', 'b', 'c'], { only: true, once: true })).to.be.false();

        expect(Hoek.contain(['a', 'b'], ['c'], { part: true })).to.be.false();
        expect(Hoek.contain(['a', 'b'], ['b'], { part: true })).to.be.true();

        expect(Hoek.contain([{ a: 1 }], [1], { deep: true })).to.be.false();
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

        expect(Hoek.contain({}, 'a')).to.be.false();
        expect(Hoek.contain({}, 'a', { only: true })).to.be.false();

        expect(Hoek.contain({ a: 'foo', b: 'bar' }, ['a', 'b', 'c'])).to.be.false();
        expect(Hoek.contain({ a: 'foo', b: 'bar' }, ['a', 'b', 'c'], { only: true })).to.be.false();
        expect(Hoek.contain({ a: 'foo', b: 'bar' }, { a: 'foo', b: 'bar', c: 'x' })).to.be.false();
        expect(Hoek.contain({ a: 'foo', b: 'bar' }, { a: 'foo', b: 'bar', c: 'x' }, { only: true })).to.be.false();

        expect(Hoek.contain({ a: 1, b: 2 }, ['c'], { part: true })).to.be.false();
        expect(Hoek.contain({ a: 1, b: 2 }, ['b'], { part: true })).to.be.true();

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

    it('supports symbols', () => {

        const sym = Symbol();

        expect(Hoek.contain([sym], sym)).to.be.true();
        expect(Hoek.contain({ [sym]: 1 }, sym)).to.be.true();
        expect(Hoek.contain({ [sym]: 1, a: 2 }, { [sym]: 1 })).to.be.true();

        expect(Hoek.contain([sym], Symbol())).to.be.false();
        expect(Hoek.contain({ [sym]: 1 }, Symbol())).to.be.false();
    });

    it('compares error keys', () => {

        const error = new Error('test');
        expect(Hoek.contain(error, { x: 1 })).to.be.false();
        expect(Hoek.contain(error, { x: 1 }, { part: true })).to.be.false();

        error.x = 1;

        expect(Hoek.contain(error, { x: 1 })).to.be.true();
        expect(Hoek.contain(error, { x: 1 }, { part: true })).to.be.true();

        expect(Hoek.contain(error, { x: 1, y: 2 })).to.be.false();
        expect(Hoek.contain(error, { x: 1, y: 2 }, { part: true })).to.be.true();
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

    const sym = Symbol();
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
            '-2': true,
            [sym]: {
                v: true
            }
        },
        i: function () { },
        j: null,
        k: [4, 8, 9, 1]
    };

    obj.i.x = 5;

    it('returns object itself', () => {

        expect(Hoek.reach(obj, null)).to.equal(obj);
        expect(Hoek.reach(obj, false)).to.equal(obj);
        expect(Hoek.reach(obj)).to.equal(obj);
        expect(Hoek.reach(obj, [])).to.equal(obj);
    });

    it('returns values of array', () => {

        expect(Hoek.reach(obj, 'k.0')).to.equal(4);
        expect(Hoek.reach(obj, 'k.1')).to.equal(8);
    });

    it('returns last value of array using negative index', () => {

        expect(Hoek.reach(obj, 'k.-1')).to.equal(1);
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
        expect(Hoek.reach(obj, 'k.x')).to.equal(undefined);
        expect(Hoek.reach(obj, 'k.1000')).to.equal(undefined);
        expect(Hoek.reach(obj, 'k/0.5', '/')).to.equal(undefined);
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

    it('allows array-based lookup', () => {

        expect(Hoek.reach(obj, ['a', 'b', 'c', 'd'])).to.equal(1);
        expect(Hoek.reach(obj, ['k', '1'])).to.equal(8);
        expect(Hoek.reach(obj, ['k', 1])).to.equal(8);
        expect(Hoek.reach(obj, ['k', '-2'])).to.equal(9);
        expect(Hoek.reach(obj, ['k', -2])).to.equal(9);
    });

    it('allows array-based lookup with symbols', () => {

        expect(Hoek.reach(obj, ['a', sym, 'v'])).to.equal(true);
        expect(Hoek.reach(obj, ['a', Symbol(), 'v'])).to.equal(undefined);
    });

    it('returns character in string', () => {

        expect(Hoek.reach(['abc'], [0])).to.equal('abc');
        expect(Hoek.reach(['abc'], ['0'])).to.equal('abc');
    });

    it('reaches sets and maps', () => {

        const value = {
            a: {
                b: new Set([
                    { x: 1 },
                    { x: 2 },
                    {
                        y: new Map([
                            ['v', 4],
                            ['w', 5]
                        ])
                    }
                ])
            }
        };

        expect(Hoek.reach(value, 'a.b.2.y.w')).to.not.exist();
        expect(Hoek.reach(value, 'a.b.2.y.w', { iterables: true })).to.equal(5);
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

    it('isn\'t prone to ReDoS given an adversarial template', () => {

        const sizes = [0, 1, 2, 3, 4]; // Should be evenly-spaced
        const times = [];
        const diffs = [];

        for (const size of sizes) {
            const start = Date.now();
            Hoek.reachTemplate({}, '{'.repeat(size * 10000));
            times.push(Date.now() - start);
        }

        for (let i = 1; i < times.length; ++i) {
            diffs.push(times[i] - times[i - 1]);
        }

        // Under ReDoS, as the size of the input increases the timing accelerates upwards,
        // i.e. each timing diff would be greater than the last.

        const diffsMonotonic = diffs[0] < diffs[1] && diffs[1] < diffs[2] && diffs[2] < diffs[3];

        expect(diffsMonotonic, 'Timing diffs monotonic').to.be.false();
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

        const err = new Error('This is spinal tap');
        const got = expect(() => Hoek.assert(false, err)).to.throw('This is spinal tap');
        expect(got).to.shallow.equal(err);
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

describe('stringify()', () => {

    it('converts object to string', () => {

        const obj = { a: 1 };
        expect(Hoek.stringify(obj)).to.equal('{"a":1}');
    });

    it('returns error in result string', () => {

        const obj = { a: 1 };
        obj.b = obj;
        expect(Hoek.stringify(obj)).to.contain('Cannot display object');
    });
});

describe('isPromise()', () => {

    it('determines if an object is a promise', async () => {

        expect(Hoek.isPromise({})).to.be.false();
        expect(Hoek.isPromise(null)).to.be.false();
        expect(Hoek.isPromise(false)).to.be.false();
        expect(Hoek.isPromise(0)).to.be.false();
        expect(Hoek.isPromise('')).to.be.false();
        expect(Hoek.isPromise({ then: 1 })).to.be.false();
        expect(Hoek.isPromise([])).to.be.false();

        const items = [
            Promise.resolve(),
            Promise.reject()
        ];

        expect(Hoek.isPromise(items[0])).to.be.true();
        expect(Hoek.isPromise(items[1])).to.be.true();
        expect(Hoek.isPromise(new Promise(Hoek.ignore))).to.be.true();
        expect(Hoek.isPromise({ then: Hoek.ignore })).to.be.true();

        try {
            await Promise.all(items);
        }
        catch (err) { }
    });
});

describe('wait()', () => {

    it('delays for timeout ms', async () => {

        const timeout = {};
        setTimeout(() => (timeout.before = true), 10);
        const wait = Hoek.wait(10);
        setTimeout(() => (timeout.after = true), 10);

        await wait;

        expect(timeout.before).to.be.true();
        expect(timeout.after).to.be.undefined();
    });

    it('delays for timeout ms as bigint', async () => {

        const timeout = {};
        setTimeout(() => (timeout.before = true), 10);
        const wait = Hoek.wait(10n);
        setTimeout(() => (timeout.after = true), 10);

        await wait;

        expect(timeout.before).to.be.true();
        expect(timeout.after).to.be.undefined();
    });

    it('handles timeouts >= 2^31', async () => {

        const flow = [];
        let no = 0;

        const fakeTimeout = function (cb, time) {

            const timer = ++no;

            flow.push(`CALL(${timer}): ${time}`);
            setImmediate(() => {

                flow.push(`PRE(${timer})`);
                cb();
                flow.push(`POST(${timer})`);
            });
        };

        await Hoek.wait(2 ** 31, null, { setTimeout: fakeTimeout });
        flow.push('DONE1');
        await Hoek.wait(2 ** 32 + 2 ** 30, null, { setTimeout: fakeTimeout });
        flow.push('DONE2');

        expect(flow).to.equal([
            'CALL(1): 2147483647',
            'PRE(1)',
            'CALL(2): 1',
            'POST(1)',
            'PRE(2)',
            'POST(2)',
            'DONE1',
            'CALL(3): 2147483647',
            'PRE(3)',
            'CALL(4): 2147483647',
            'POST(3)',
            'PRE(4)',
            'CALL(5): 1073741826',
            'POST(4)',
            'PRE(5)',
            'POST(5)',
            'DONE2'
        ]);
    });

    it('returns never resolving promise when timeout >= Number.MAX_SAFE_INTEGER', async () => {

        let calls = 0;
        const fakeTimeout = function (cb) {

            ++calls;
            process.nextTick(cb);
        };

        await Hoek.wait(2 ** 31 - 1, null, { setTimeout: fakeTimeout });
        expect(calls).to.equal(1);

        const waited = Symbol('waited');

        const result = await Promise.race([
            Hoek.wait(1, waited),
            Hoek.wait(Number.MAX_SAFE_INTEGER, null, { setTimeout: fakeTimeout }),
            Hoek.wait(Infinity, null, { setTimeout: fakeTimeout })
        ]);

        expect(result).to.be.equal(waited);
        expect(calls).to.equal(1);
    });

    it('handles a return value', async () => {

        const uniqueValue = {};
        const timeout = {};
        setTimeout(() => (timeout.before = true), 10);
        const wait = Hoek.wait(10, uniqueValue);
        setTimeout(() => (timeout.after = true), 10);

        expect(await wait).to.shallow.equal(uniqueValue);
        expect(timeout.before).to.be.true();
        expect(timeout.after).to.be.undefined();
    });

    it('undefined timeout resolves immediately', async () => {

        const waited = Symbol('waited');
        const result = await Promise.race([
            Hoek.wait(undefined, waited),
            Hoek.wait(0)
        ]);

        expect(result).to.equal(waited);
    });

    it('NaN timeout resolves immediately', async () => {

        const waited = Symbol('waited');
        const result = await Promise.race([
            Hoek.wait(Number.NaN, waited),
            Hoek.wait(0)
        ]);

        expect(result).to.equal(waited);
    });

    it('rejects on weird timeout values', async () => {

        await expect(() => Hoek.wait({})).to.throw();
        await expect(() => Hoek.wait(Symbol('hi'))).to.throw();
    });
});

describe('block()', () => {

    it('returns a promise', () => {

        expect(Hoek.block()).to.be.instanceOf(Promise);
    });

    it('does not immediately reject or resolve', async () => {

        const promise = Hoek.block();
        const waited = Symbol('waited');

        const result = await Promise.race([
            Hoek.wait(1, waited),
            promise
        ]);

        expect(result).to.be.equal(waited);
    });
});
