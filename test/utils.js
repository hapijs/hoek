var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var Hoek = require('../lib/hoek');


describe('Hoek', function () {

    var emptyObj = {};
    var nestedObj = {
        x: 'x',
        y: 'y',
        z: new Date()
    };

    var dupsArray = [nestedObj, { z: 'z' }, nestedObj];
    var reducedDupsArray = [nestedObj, { z: 'z' }];

    describe('#clone', function () {

        it('should clone a nested object', function (done) {

            var a = nestedObj;
            var b = Hoek.clone(a);

            assert.deepEqual(a, b);
            b.z.should.equal(a.z);
            done();
        })
    });

    describe('#merge', function () {

        it('should', function (done) {

            var a = emptyObj;
            var b = nestedObj;

            var c = Hoek.merge(a, b);
            assert.deepEqual(a, b);
            assert.deepEqual(c, b);
            done();
        });
    });

    describe('#unique', function () {

        it('should ensure uniqueness within array of objects based on subkey', function (done) {

            var a = Hoek.unique(dupsArray, 'x');
            assert.deepEqual(a, reducedDupsArray);
            done();
        });
    });

    describe('#mapToObject', function () {

        it('should convert basic array to existential object', function (done) {

            var keys = [1, 2, 3, 4];
            var a = Hoek.mapToObject(keys);
            for (var i in keys) {
                a[keys[i]].should.equal(true);
            }
            done();
        });

        it('should convert array of objects to existential object', function (done) {

            var keys = [{ x: 1 }, { x: 2 }, { x: 3 }];
            var subkey = 'x';
            var a = Hoek.mapToObject(keys, subkey);
            for (var i in keys) {
                a[keys[i][subkey]].should.equal(true);
            }
            done();
        });
    });

    describe('#intersect', function () {

        it('should return the common objects of two arrays', function (done) {

            var array1 = [1, 2, 3, 4, 4, 5, 5];
            var array2 = [5, 4, 5, 6, 7];
            var common = Hoek.intersect(array1, array2);
            common.length.should.equal(2);
            done();
        });
    });

    describe('#removeKeys', function () {

        var objWithHiddenKeys = {
            location: {
                name: 'San Bruno'
            },
            company: {
                name: '@WalmartLabs'
            }
        };

        it('should delete params with definition\'s hide set to true', function (done) {

            var a = Hoek.removeKeys(objWithHiddenKeys, ['location']);
            should.not.exist(objWithHiddenKeys.location);
            should.exist(objWithHiddenKeys.company);
            done();
        });
    });

    describe('#assert', function () {

        it('should throw an Error when using assert in a test', function (done) {

            (function () {

                Hoek.assert(false, 'my error message');
            }).should.throw('my error message');
            done();
        });
    });

    describe('#escapeRegex', function () {

        it('should escape all special regular expression characters', function (done) {

            var a = Hoek.escapeRegex('4^f$s.4*5+-_?%=#!:@|~\\/`"(>)[<]d{}s,');
            a.should.equal('4\\^f\\$s\\.4\\*5\\+\\-_\\?%\\=#\\!\\:@\\|~\\\\\\/`"\\(>\\)\\[<\\]d\\{\\}s\\,');
            done();
        });
    });

    describe('#toss', function () {

        it('should call callback with new error', function (done) {

            var callback = function (err) {

                should.exist(err);
                err.message.should.equal('bug');
                done();
            };

            Hoek.toss(true, 'feature', callback);
            Hoek.toss(false, 'bug', callback);
        });

        it('should call callback with new error and no message', function (done) {

            Hoek.toss(false, function (err) {

                should.exist(err);
                err.message.should.equal('');
                done();
            });
        });

        it('should call callback with error condition', function (done) {

            Hoek.toss(new Error('boom'), function (err) {

                should.exist(err);
                err.message.should.equal('boom');
                done();
            });
        });

        it('should call callback with new error using message with error condition', function (done) {

            Hoek.toss(new Error('ka'), 'boom', function (err) {

                should.exist(err);
                err.message.should.equal('boom');
                done();
            });
        });

        it('should call callback with new error using passed error with error condition', function (done) {

            Hoek.toss(new Error('ka'), new Error('boom'), function (err) {

                should.exist(err);
                err.message.should.equal('boom');
                done();
            });
        });
    });

    describe('Base64Url', function () {

        var base64str = 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0-P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn-AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq-wsbKztLW2t7i5uru8vb6_wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t_g4eLj5OXm5-jp6uvs7e7v8PHy8_T19vf4-fr7_P3-_w';
        var str = unescape('%00%01%02%03%04%05%06%07%08%09%0A%0B%0C%0D%0E%0F%10%11%12%13%14%15%16%17%18%19%1A%1B%1C%1D%1E%1F%20%21%22%23%24%25%26%27%28%29*+%2C-./0123456789%3A%3B%3C%3D%3E%3F@ABCDEFGHIJKLMNOPQRSTUVWXYZ%5B%5C%5D%5E_%60abcdefghijklmnopqrstuvwxyz%7B%7C%7D%7E%7F%80%81%82%83%84%85%86%87%88%89%8A%8B%8C%8D%8E%8F%90%91%92%93%94%95%96%97%98%99%9A%9B%9C%9D%9E%9F%A0%A1%A2%A3%A4%A5%A6%A7%A8%A9%AA%AB%AC%AD%AE%AF%B0%B1%B2%B3%B4%B5%B6%B7%B8%B9%BA%BB%BC%BD%BE%BF%C0%C1%C2%C3%C4%C5%C6%C7%C8%C9%CA%CB%CC%CD%CE%CF%D0%D1%D2%D3%D4%D5%D6%D7%D8%D9%DA%DB%DC%DD%DE%DF%E0%E1%E2%E3%E4%E5%E6%E7%E8%E9%EA%EB%EC%ED%EE%EF%F0%F1%F2%F3%F4%F5%F6%F7%F8%F9%FA%FB%FC%FD%FE%FF');

        describe('#base64urlEncode', function () {

            it('should base64 URL-safe a string', function (done) {

                Hoek.base64urlEncode(str).should.equal(base64str);
                done();
            });
        });

        describe('#base64urlDecode', function () {

            it('should un-base64 URL-safe a string', function (done) {

                Hoek.base64urlDecode(base64str).should.equal(str);
                done();
            });
        });
    });

    describe('#escapeHeaderAttribute', function () {

        it('should escape all special HTTP header attribute characters', function (done) {

            var a = Hoek.escapeHeaderAttribute('I said "go w\\o me"');
            a.should.equal('I said \\"go w\\\\o me\\"');
            done();
        });
    });

    describe('#escapeHtml', function () {

        it('should escape all special HTML characters', function (done) {

            var a = Hoek.escapeHtml('&<>"\'`');
            a.should.equal('&amp;&lt;&gt;&quot;&#x27;&#x60;');
            done();
        });
    });
});

