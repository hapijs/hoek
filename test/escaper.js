'use strict';

// Load modules

const Code = require('code');
const Hoek = require('../lib');
const Lab = require('lab');


// Declare internals

const internals = {};


// Test shortcuts

const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


describe('escapeHtml()', () => {

    it('encodes / characters', () => {

        const encoded = Hoek.escapeHtml('<script>alert(1)</script>');
        expect(encoded).to.equal('&lt;script&gt;alert&#x28;1&#x29;&lt;&#x2f;script&gt;');
    });

    it('encodes < and > as named characters', () => {

        const encoded = Hoek.escapeHtml('<script><>');
        expect(encoded).to.equal('&lt;script&gt;&lt;&gt;');
    });

    it('encodes large unicode characters', () => {

        const encoded = Hoek.escapeHtml(String.fromCharCode(500) + String.fromCharCode(1000));
        expect(encoded).to.equal('&#500;&#1000;');
    });

    it('doesn\'t throw an exception when passed null', () => {

        const encoded = Hoek.escapeHtml(null);
        expect(encoded).to.equal('');
    });

    it('encodes {} characters', () => {

        const encoded = Hoek.escapeHtml('{}');
        expect(encoded).to.equal('&#x7b;&#x7d;');
    });
});

describe('escapeJson()', () => {

    it('encodes < and > as unicode escaped equivalents', () => {

        const encoded = Hoek.escapeJson('<script><>');
        expect(encoded).to.equal('\\u003cscript\\u003e\\u003c\\u003e');
    });

    it('doesn\'t encode \0 as hex escaped equivalent', () => {

        const encoded = Hoek.escapeJson('\0');
        expect(encoded).to.equal('\0');
    });

    it('encodes & (ampersand) as unicode escaped equivalent', () => {

        const encoded = Hoek.escapeJson('&&');
        expect(encoded).to.equal('\\u0026\\u0026');
    });

    it('encodes line seperator as unicode escaped equivalent', () => {

        const lineSeparator = String.fromCharCode(0x2028);
        const encoded = Hoek.escapeJson(lineSeparator);
        expect(encoded).to.equal('\\u2028');
    });

    it('encodes paragraph seperator as unicode escaped equivalent', () => {

        const paragraphSeparator = String.fromCharCode(0x2029);
        const encoded = Hoek.escapeJson(paragraphSeparator);
        expect(encoded).to.equal('\\u2029');
    });

    it('doesn\'t encode U+13F0 Cherokee Letter Ye as unicode escaped equivalent', () => {

        const encoded = Hoek.escapeJson('Ᏸ');
        expect(encoded).to.equal('Ᏸ');
    });

    it('doesn\'t encode U+1F4A9 PILE OF POO as unicode escaped equivalent', () => {

        const encoded = Hoek.escapeJson('💩');
        expect(encoded).to.equal('💩');
    });

    it('doesn\'t encode U+1D306 TETRAGRAM FOR CENTRE as unicode escaped equivalent', () => {

        const encoded = Hoek.escapeJson('𝌆');
        expect(encoded).to.equal('𝌆');
    });

    it('doesn\'t encode \\ (backslash)', () => {

        const encoded = Hoek.escapeJson('\\');
        expect(encoded).to.equal('\\');
    });

    it('doesn\'t throw an exception when passed null', () => {

        const encoded = Hoek.escapeJson(null);
        expect(encoded).to.equal('');
    });

    it('doesn\'t encode {} characters', () => {

        const encoded = Hoek.escapeJson('{}');
        expect(encoded).to.equal('{}');
    });

    it('doesn\'t encode / (slash) character', () => {

        const encoded = Hoek.escapeJson('<script>alert(1)</script>');
        expect(encoded).to.equal('\\u003cscript\\u003ealert(1)\\u003c/script\\u003e');
    });
});
