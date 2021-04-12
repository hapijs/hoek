'use strict';

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');


const { before, describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


describe('import()', () => {

    let Hoek;

    before(async () => {

        Hoek = await import('../lib/index.js');
    });

    it('exposes all methods and classes as named imports', () => {

        expect(Object.keys(Hoek)).to.equal([
            'Bench',
            'Error',
            'applyToDefaults',
            'assert',
            'block',
            'clone',
            'contain',
            'deepEqual',
            'default',
            'escapeHeaderAttribute',
            'escapeHtml',
            'escapeJson',
            'escapeRegex',
            'flatten',
            'ignore',
            'intersect',
            'isPromise',
            'merge',
            'once',
            'reach',
            'reachTemplate',
            'stringify',
            'wait'
        ]);
    });
});
