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
    });
});

