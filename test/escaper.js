'use strict';

const Code = require('code');
const Hoek = require('../lib');
const Lab = require('lab');


const internals = {};


const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const it = lab.test;
const expect = Code.expect;


describe('escapeJavaScript()', () => {

    it('encodes / characters', (done) => {

        const encoded = Hoek.escapeJavaScript('<script>alert(1)</script>');
        expect(encoded).to.equal('\\x3cscript\\x3ealert\\x281\\x29\\x3c\\x2fscript\\x3e');
        done();
    });

    it('encodes \' characters', (done) => {

        const encoded = Hoek.escapeJavaScript('something(\'param\')');
        expect(encoded).to.equal('something\\x28\\x27param\\x27\\x29');
        done();
    });

    it('encodes large unicode characters with the correct padding', (done) => {

        const encoded = Hoek.escapeJavaScript(String.fromCharCode(500) + String.fromCharCode(1000));
        expect(encoded).to.equal('\\u0500\\u1000');
        done();
    });

    it('doesn\'t throw an exception when passed null', (done) => {

        const encoded = Hoek.escapeJavaScript(null);
        expect(encoded).to.equal('');
        done();
    });
});

describe('escapeHtml()', () => {

    it('encodes / characters', (done) => {

        const encoded = Hoek.escapeHtml('<script>alert(1)</script>');
        expect(encoded).to.equal('&lt;script&gt;alert&#x28;1&#x29;&lt;&#x2f;script&gt;');
        done();
    });

    it('encodes < and > as named characters', (done) => {

        const encoded = Hoek.escapeHtml('<script><>');
        expect(encoded).to.equal('&lt;script&gt;&lt;&gt;');
        done();
    });

    it('encodes large unicode characters', (done) => {

        const encoded = Hoek.escapeHtml(String.fromCharCode(500) + String.fromCharCode(1000));
        expect(encoded).to.equal('&#500;&#1000;');
        done();
    });

    it('doesn\'t throw an exception when passed null', (done) => {

        const encoded = Hoek.escapeHtml(null);
        expect(encoded).to.equal('');
        done();
    });

    it('encodes {} characters', (done) => {

        const encoded = Hoek.escapeHtml('{}');
        expect(encoded).to.equal('&#x7b;&#x7d;');
        done();
    });
});

describe('escapeJson()', () => {

    it('encodes < and > as unicode escaped equivalents', (done) => {

        const encoded = Hoek.escapeJson('<script><>');
        expect(encoded).to.equal('\\u003cscript\\u003e\\u003c\\u003e');
        done();
    });

    it('doesn\'t encode \0 as hex escaped equivalent', (done) => {

        const encoded = Hoek.escapeJson('\0');
        expect(encoded).to.equal('\0');
        done();
    });

    it('encodes & (ampersand) as unicode escaped equivalent', (done) => {

        const encoded = Hoek.escapeJson('&&');
        expect(encoded).to.equal('\\u0026\\u0026');
        done();
    });

    it('encodes line seperator as unicode escaped equivalent', (done) => {

        const lineSeparator = String.fromCharCode(0x2028);
        const encoded = Hoek.escapeJson(lineSeparator);
        expect(encoded).to.equal('\\u2028');
        done();
    });

    it('encodes paragraph seperator as unicode escaped equivalent', (done) => {

        const paragraphSeparator = String.fromCharCode(0x2029);
        const encoded = Hoek.escapeJson(paragraphSeparator);
        expect(encoded).to.equal('\\u2029');
        done();
    });

    it('doesn\'t encode U+13F0 Cherokee Letter Ye as unicode escaped equivalent', (done) => {

        const encoded = Hoek.escapeJson('Ᏸ');
        expect(encoded).to.equal('Ᏸ');
        done();
    });

    it('doesn\'t encode U+1F4A9 PILE OF POO as unicode escaped equivalent', (done) => {

        const encoded = Hoek.escapeJson('💩');
        expect(encoded).to.equal('💩');
        done();
    });

    it('doesn\'t encode U+1D306 TETRAGRAM FOR CENTRE as unicode escaped equivalent', (done) => {

        const encoded = Hoek.escapeJson('𝌆');
        expect(encoded).to.equal('𝌆');
        done();
    });

    it('doesn\'t encode \\ (backslash)', (done) => {

        const encoded = Hoek.escapeJson('\\');
        expect(encoded).to.equal('\\');
        done();
    });

    it('doesn\'t throw an exception when passed null', (done) => {

        const encoded = Hoek.escapeJson(null);
        expect(encoded).to.equal('');
        done();
    });

    it('doesn\'t encode {} characters', (done) => {

        const encoded = Hoek.escapeJson('{}');
        expect(encoded).to.equal('{}');
        done();
    });

    it('doesn\'t encode / (slash) character', (done) => {

        const encoded = Hoek.escapeJson('<script>alert(1)</script>');
        expect(encoded).to.equal('\\u003cscript\\u003ealert(1)\\u003c/script\\u003e');
        done();
    });
});
