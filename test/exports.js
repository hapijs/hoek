'use strict';

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const Hoek = require('..');


const internals = {};


const { before, describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


internals.uncapitalize = (str) => {

    // Used capitalized classes like "Bench" and "Error"

    return str[0].toLowerCase() + str.slice(1);
};


describe('ESM', () => {

    let esmHoek;

    before(async () => {

        esmHoek = await import('@hapi/hoek');
    });

    it('exposes all methods and classes as named imports', () => {

        const rlist = Object.keys(Hoek).sort();
        const mlist = Object.keys(esmHoek).sort();

        expect(mlist).to.equal(rlist);
        expect(esmHoek).to.equal(Hoek);
        expect(esmHoek).to.not.shallow.equal(Hoek);
    });

    it('exposes all methods and classes as direct imports', async () => {

        const exported = await Promise.all(Object.keys(Hoek).map((item) => import(`@hapi/hoek/${internals.uncapitalize(item)}`)));
        const defaulted = exported.map((item) => item.default);

        expect(defaulted).to.equal(Object.values(Hoek));
    });

    it('can call an exported destructured method', () => {

        const { assert } = esmHoek;

        expect(() => assert(false, 'oops')).to.throw('oops');
    });

    it('exports identical classes as CJS', async () => {

        const error = (await import(`@hapi/hoek/assertError`)).default;

        expect(error).to.shallow.equal(Hoek.AssertError);
        expect(error).to.shallow.equal(esmHoek.AssertError);
    });
});


describe('package', () => {

    it('exports all methods and classes', () => {

        const exported = Object.keys(Hoek).map((item) => require(`@hapi/hoek/${internals.uncapitalize(item)}`));

        expect(exported).to.equal(Object.values(Hoek));
    });

    it('can call an exported method', () => {

        const assert = require(`@hapi/hoek/assert`);

        expect(() => assert(false, 'oops')).to.throw('oops');
    });

    it('does not export unlisted modules', () => {

        expect(() => require('@hapi/hoek/types')).to.throw();
        expect(() => require('@hapi/hoek/utils')).to.throw();
    });
});
