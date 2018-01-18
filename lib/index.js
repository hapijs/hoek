'use strict';

// Load modules

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _isSafeInteger = require('babel-runtime/core-js/number/is-safe-integer');

var _isSafeInteger2 = _interopRequireDefault(_isSafeInteger);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _getOwnPropertyNames = require('babel-runtime/core-js/object/get-own-property-names');

var _getOwnPropertyNames2 = _interopRequireDefault(_getOwnPropertyNames);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Assert = require('assert');
var Crypto = require('crypto');
var Path = require('path');
var Util = require('util');

var Escape = require('./escape');

// Declare internals

var internals = {};

// Clone object or array

exports.clone = function (obj, seen) {

    if ((typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) !== 'object' || obj === null) {

        return obj;
    }

    seen = seen || new _map2.default();

    var lookup = seen.get(obj);
    if (lookup) {
        return lookup;
    }

    var newObj = void 0;
    var cloneDeep = false;

    if (!Array.isArray(obj)) {
        if (Buffer.isBuffer(obj)) {
            newObj = new Buffer(obj);
        } else if (obj instanceof Date) {
            newObj = new Date(obj.getTime());
        } else if (obj instanceof RegExp) {
            newObj = new RegExp(obj);
        } else {
            var proto = (0, _getPrototypeOf2.default)(obj);
            if (proto && proto.isImmutable) {

                newObj = obj;
            } else {
                newObj = (0, _create2.default)(proto);
                cloneDeep = true;
            }
        }
    } else {
        newObj = [];
        cloneDeep = true;
    }

    seen.set(obj, newObj);

    if (cloneDeep) {
        var keys = (0, _getOwnPropertyNames2.default)(obj);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            var descriptor = (0, _getOwnPropertyDescriptor2.default)(obj, key);
            if (descriptor && (descriptor.get || descriptor.set)) {

                (0, _defineProperty2.default)(newObj, key, descriptor);
            } else {
                newObj[key] = exports.clone(obj[key], seen);
            }
        }
    }

    return newObj;
};

// Merge all the properties of source into target, source wins in conflict, and by default null and undefined from source are applied

/*eslint-disable */
exports.merge = function (target, source, isNullOverride /* = true */, isMergeArrays /* = true */) {
    /*eslint-enable */

    exports.assert(target && (typeof target === 'undefined' ? 'undefined' : (0, _typeof3.default)(target)) === 'object', 'Invalid target value: must be an object');
    exports.assert(source === null || source === undefined || (typeof source === 'undefined' ? 'undefined' : (0, _typeof3.default)(source)) === 'object', 'Invalid source value: must be null, undefined, or an object');

    if (!source) {
        return target;
    }

    if (Array.isArray(source)) {
        exports.assert(Array.isArray(target), 'Cannot merge array onto an object');
        if (isMergeArrays === false) {
            // isMergeArrays defaults to true
            target.length = 0; // Must not change target assignment
        }

        for (var i = 0; i < source.length; ++i) {
            target.push(exports.clone(source[i]));
        }

        return target;
    }

    var keys = (0, _keys2.default)(source);
    for (var _i = 0; _i < keys.length; ++_i) {
        var key = keys[_i];
        var value = source[key];
        if (value && (typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) === 'object') {

            if (!target[key] || (0, _typeof3.default)(target[key]) !== 'object' || Array.isArray(target[key]) !== Array.isArray(value) || value instanceof Date || Buffer.isBuffer(value) || value instanceof RegExp) {

                target[key] = exports.clone(value);
            } else {
                exports.merge(target[key], value, isNullOverride, isMergeArrays);
            }
        } else {
            if (value !== null && value !== undefined) {
                // Explicit to preserve empty strings

                target[key] = value;
            } else if (isNullOverride !== false) {
                // Defaults to true
                target[key] = value;
            }
        }
    }

    return target;
};

// Apply options to a copy of the defaults

exports.applyToDefaults = function (defaults, options, isNullOverride) {

    exports.assert(defaults && (typeof defaults === 'undefined' ? 'undefined' : (0, _typeof3.default)(defaults)) === 'object', 'Invalid defaults value: must be an object');
    exports.assert(!options || options === true || (typeof options === 'undefined' ? 'undefined' : (0, _typeof3.default)(options)) === 'object', 'Invalid options value: must be true, falsy or an object');

    if (!options) {
        // If no options, return null
        return null;
    }

    var copy = exports.clone(defaults);

    if (options === true) {
        // If options is set to true, use defaults
        return copy;
    }

    return exports.merge(copy, options, isNullOverride === true, false);
};

// Clone an object except for the listed keys which are shallow copied

exports.cloneWithShallow = function (source, keys) {

    if (!source || (typeof source === 'undefined' ? 'undefined' : (0, _typeof3.default)(source)) !== 'object') {

        return source;
    }

    var storage = internals.store(source, keys); // Move shallow copy items to storage
    var copy = exports.clone(source); // Deep copy the rest
    internals.restore(copy, source, storage); // Shallow copy the stored items and restore
    return copy;
};

internals.store = function (source, keys) {

    var storage = {};
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var value = exports.reach(source, key);
        if (value !== undefined) {
            storage[key] = value;
            internals.reachSet(source, key, undefined);
        }
    }

    return storage;
};

internals.restore = function (copy, source, storage) {

    var keys = (0, _keys2.default)(storage);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        internals.reachSet(copy, key, storage[key]);
        internals.reachSet(source, key, storage[key]);
    }
};

internals.reachSet = function (obj, key, value) {

    var path = key.split('.');
    var ref = obj;
    for (var i = 0; i < path.length; ++i) {
        var segment = path[i];
        if (i + 1 === path.length) {
            ref[segment] = value;
        }

        ref = ref[segment];
    }
};

// Apply options to defaults except for the listed keys which are shallow copied from option without merging

exports.applyToDefaultsWithShallow = function (defaults, options, keys) {

    exports.assert(defaults && (typeof defaults === 'undefined' ? 'undefined' : (0, _typeof3.default)(defaults)) === 'object', 'Invalid defaults value: must be an object');
    exports.assert(!options || options === true || (typeof options === 'undefined' ? 'undefined' : (0, _typeof3.default)(options)) === 'object', 'Invalid options value: must be true, falsy or an object');
    exports.assert(keys && Array.isArray(keys), 'Invalid keys');

    if (!options) {
        // If no options, return null
        return null;
    }

    var copy = exports.cloneWithShallow(defaults, keys);

    if (options === true) {
        // If options is set to true, use defaults
        return copy;
    }

    var storage = internals.store(options, keys); // Move shallow copy items to storage
    exports.merge(copy, options, false, false); // Deep copy the rest
    internals.restore(copy, options, storage); // Shallow copy the stored items and restore
    return copy;
};

// Deep object or array comparison

exports.deepEqual = function (obj, ref, options, seen) {

    options = options || { prototype: true };

    var type = typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj);

    if (type !== (typeof ref === 'undefined' ? 'undefined' : (0, _typeof3.default)(ref))) {
        return false;
    }

    if (type !== 'object' || obj === null || ref === null) {

        if (obj === ref) {
            // Copied from Deep-eql, copyright(c) 2013 Jake Luer, jake@alogicalparadox.com, MIT Licensed, https://github.com/chaijs/deep-eql
            return obj !== 0 || 1 / obj === 1 / ref; // -0 / +0
        }

        return obj !== obj && ref !== ref; // NaN
    }

    seen = seen || [];
    if (seen.indexOf(obj) !== -1) {
        return true; // If previous comparison failed, it would have stopped execution
    }

    seen.push(obj);

    if (Array.isArray(obj)) {
        if (!Array.isArray(ref)) {
            return false;
        }

        if (!options.part && obj.length !== ref.length) {
            return false;
        }

        for (var i = 0; i < obj.length; ++i) {
            if (options.part) {
                var found = false;
                for (var j = 0; j < ref.length; ++j) {
                    if (exports.deepEqual(obj[i], ref[j], options)) {
                        found = true;
                        break;
                    }
                }

                return found;
            }

            if (!exports.deepEqual(obj[i], ref[i], options)) {
                return false;
            }
        }

        return true;
    }

    if (Buffer.isBuffer(obj)) {
        if (!Buffer.isBuffer(ref)) {
            return false;
        }

        if (obj.length !== ref.length) {
            return false;
        }

        for (var _i2 = 0; _i2 < obj.length; ++_i2) {
            if (obj[_i2] !== ref[_i2]) {
                return false;
            }
        }

        return true;
    }

    if (obj instanceof Date) {
        return ref instanceof Date && obj.getTime() === ref.getTime();
    }

    if (obj instanceof RegExp) {
        return ref instanceof RegExp && obj.toString() === ref.toString();
    }

    if (options.prototype) {
        if ((0, _getPrototypeOf2.default)(obj) !== (0, _getPrototypeOf2.default)(ref)) {
            return false;
        }
    }

    var keys = (0, _getOwnPropertyNames2.default)(obj);

    if (!options.part && keys.length !== (0, _getOwnPropertyNames2.default)(ref).length) {
        return false;
    }

    for (var _i3 = 0; _i3 < keys.length; ++_i3) {
        var key = keys[_i3];
        var descriptor = (0, _getOwnPropertyDescriptor2.default)(obj, key);
        if (descriptor.get) {
            if (!exports.deepEqual(descriptor, (0, _getOwnPropertyDescriptor2.default)(ref, key), options, seen)) {
                return false;
            }
        } else if (!exports.deepEqual(obj[key], ref[key], options, seen)) {
            return false;
        }
    }

    return true;
};

// Remove duplicate items from array

exports.unique = function (array, key) {

    var result = void 0;
    if (key) {
        result = [];
        var index = new _set2.default();
        array.forEach(function (item) {

            var identifier = item[key];
            if (!index.has(identifier)) {
                index.add(identifier);
                result.push(item);
            }
        });
    } else {
        result = (0, _from2.default)(new _set2.default(array));
    }

    return result;
};

// Convert array into object

exports.mapToObject = function (array, key) {

    if (!array) {
        return null;
    }

    var obj = {};
    for (var i = 0; i < array.length; ++i) {
        if (key) {
            if (array[i][key]) {
                obj[array[i][key]] = true;
            }
        } else {
            obj[array[i]] = true;
        }
    }

    return obj;
};

// Find the common unique items in two arrays

exports.intersect = function (array1, array2, justFirst) {

    if (!array1 || !array2) {
        return [];
    }

    var common = [];
    var hash = Array.isArray(array1) ? exports.mapToObject(array1) : array1;
    var found = {};
    for (var i = 0; i < array2.length; ++i) {
        if (hash[array2[i]] && !found[array2[i]]) {
            if (justFirst) {
                return array2[i];
            }

            common.push(array2[i]);
            found[array2[i]] = true;
        }
    }

    return justFirst ? null : common;
};

// Test if the reference contains the values

exports.contain = function (ref, values, options) {

    /*
        string -> string(s)
        array -> item(s)
        object -> key(s)
        object -> object (key:value)
    */

    var valuePairs = null;
    if ((typeof ref === 'undefined' ? 'undefined' : (0, _typeof3.default)(ref)) === 'object' && (typeof values === 'undefined' ? 'undefined' : (0, _typeof3.default)(values)) === 'object' && !Array.isArray(ref) && !Array.isArray(values)) {

        valuePairs = values;
        values = (0, _keys2.default)(values);
    } else {
        values = [].concat(values);
    }

    options = options || {}; // deep, once, only, part

    exports.assert(typeof ref === 'string' || (typeof ref === 'undefined' ? 'undefined' : (0, _typeof3.default)(ref)) === 'object', 'Reference must be string or an object');
    exports.assert(values.length, 'Values array cannot be empty');

    var compare = void 0;
    var compareFlags = void 0;
    if (options.deep) {
        compare = exports.deepEqual;

        var hasOnly = options.hasOwnProperty('only');
        var hasPart = options.hasOwnProperty('part');

        compareFlags = {
            prototype: hasOnly ? options.only : hasPart ? !options.part : false,
            part: hasOnly ? !options.only : hasPart ? options.part : true
        };
    } else {
        compare = function compare(a, b) {
            return a === b;
        };
    }

    var misses = false;
    var matches = new Array(values.length);
    for (var i = 0; i < matches.length; ++i) {
        matches[i] = 0;
    }

    if (typeof ref === 'string') {
        var pattern = '(';
        for (var _i4 = 0; _i4 < values.length; ++_i4) {
            var value = values[_i4];
            exports.assert(typeof value === 'string', 'Cannot compare string reference to non-string value');
            pattern += (_i4 ? '|' : '') + exports.escapeRegex(value);
        }

        var regex = new RegExp(pattern + ')', 'g');
        var leftovers = ref.replace(regex, function ($0, $1) {

            var index = values.indexOf($1);
            ++matches[index];
            return ''; // Remove from string
        });

        misses = !!leftovers;
    } else if (Array.isArray(ref)) {
        for (var _i5 = 0; _i5 < ref.length; ++_i5) {
            var matched = false;
            for (var j = 0; j < values.length && matched === false; ++j) {
                matched = compare(values[j], ref[_i5], compareFlags) && j;
            }

            if (matched !== false) {
                ++matches[matched];
            } else {
                misses = true;
            }
        }
    } else {
        var keys = (0, _getOwnPropertyNames2.default)(ref);
        for (var _i6 = 0; _i6 < keys.length; ++_i6) {
            var key = keys[_i6];
            var pos = values.indexOf(key);
            if (pos !== -1) {
                if (valuePairs && !compare(valuePairs[key], ref[key], compareFlags)) {

                    return false;
                }

                ++matches[pos];
            } else {
                misses = true;
            }
        }
    }

    var result = false;
    for (var _i7 = 0; _i7 < matches.length; ++_i7) {
        result = result || !!matches[_i7];
        if (options.once && matches[_i7] > 1 || !options.part && !matches[_i7]) {

            return false;
        }
    }

    if (options.only && misses) {

        return false;
    }

    return result;
};

// Flatten array

exports.flatten = function (array, target) {

    var result = target || [];

    for (var i = 0; i < array.length; ++i) {
        if (Array.isArray(array[i])) {
            exports.flatten(array[i], result);
        } else {
            result.push(array[i]);
        }
    }

    return result;
};

// Convert an object key chain string ('a.b.c') to reference (object[a][b][c])

exports.reach = function (obj, chain, options) {

    if (chain === false || chain === null || typeof chain === 'undefined') {

        return obj;
    }

    options = options || {};
    if (typeof options === 'string') {
        options = { separator: options };
    }

    var path = chain.split(options.separator || '.');
    var ref = obj;
    for (var i = 0; i < path.length; ++i) {
        var key = path[i];
        if (key[0] === '-' && Array.isArray(ref)) {
            key = key.slice(1, key.length);
            key = ref.length - key;
        }

        if (!ref || !(((typeof ref === 'undefined' ? 'undefined' : (0, _typeof3.default)(ref)) === 'object' || typeof ref === 'function') && key in ref) || (typeof ref === 'undefined' ? 'undefined' : (0, _typeof3.default)(ref)) !== 'object' && options.functions === false) {
            // Only object and function can have properties

            exports.assert(!options.strict || i + 1 === path.length, 'Missing segment', key, 'in reach path ', chain);
            exports.assert((typeof ref === 'undefined' ? 'undefined' : (0, _typeof3.default)(ref)) === 'object' || options.functions === true || typeof ref !== 'function', 'Invalid segment', key, 'in reach path ', chain);
            ref = options.default;
            break;
        }

        ref = ref[key];
    }

    return ref;
};

exports.reachTemplate = function (obj, template, options) {

    return template.replace(/{([^}]+)}/g, function ($0, chain) {

        var value = exports.reach(obj, chain, options);
        return value === undefined || value === null ? '' : value;
    });
};

exports.formatStack = function (stack) {

    var trace = [];
    for (var i = 0; i < stack.length; ++i) {
        var item = stack[i];
        trace.push([item.getFileName(), item.getLineNumber(), item.getColumnNumber(), item.getFunctionName(), item.isConstructor()]);
    }

    return trace;
};

exports.formatTrace = function (trace) {

    var display = [];

    for (var i = 0; i < trace.length; ++i) {
        var row = trace[i];
        display.push((row[4] ? 'new ' : '') + row[3] + ' (' + row[0] + ':' + row[1] + ':' + row[2] + ')');
    }

    return display;
};

exports.callStack = function (slice) {

    // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi

    var v8 = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {

        return stack;
    };

    var capture = {};
    Error.captureStackTrace(capture, this);
    var stack = capture.stack;

    Error.prepareStackTrace = v8;

    var trace = exports.formatStack(stack);

    return trace.slice(1 + slice);
};

exports.displayStack = function (slice) {

    var trace = exports.callStack(slice === undefined ? 1 : slice + 1);

    return exports.formatTrace(trace);
};

exports.abortThrow = false;

exports.abort = function (message, hideStack) {

    if (process.env.NODE_ENV === 'test' || exports.abortThrow === true) {
        throw new Error(message || 'Unknown error');
    }

    var stack = '';
    if (!hideStack) {
        stack = exports.displayStack(1).join('\n\t');
    }
    console.log('ABORT: ' + message + '\n\t' + stack);
    process.exit(1);
};

exports.assert = function (condition) {

    if (condition) {
        return;
    }

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    if (args.length === 1 && args[0] instanceof Error) {
        throw args[0];
    }

    var msgs = args.filter(function (arg) {
        return arg !== '';
    }).map(function (arg) {

        return typeof arg === 'string' ? arg : arg instanceof Error ? arg.message : exports.stringify(arg);
    });

    throw new Assert.AssertionError({
        message: msgs.join(' ') || 'Unknown error',
        actual: false,
        expected: true,
        operator: '==',
        stackStartFunction: exports.assert
    });
};

exports.Bench = function () {

    this.ts = 0;
    this.reset();
};

exports.Bench.prototype.reset = function () {

    this.ts = exports.Bench.now();
};

exports.Bench.prototype.elapsed = function () {

    return exports.Bench.now() - this.ts;
};

exports.Bench.now = function () {

    var ts = process.hrtime();
    return ts[0] * 1e3 + ts[1] / 1e6;
};

// Escape string for Regex construction

exports.escapeRegex = function (string) {

    // Escape ^$.*+-?=!:|\/()[]{},
    return string.replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\,]/g, '\\$&');
};

// Base64url (RFC 4648) encode

exports.base64urlEncode = function (value, encoding) {

    exports.assert(typeof value === 'string' || Buffer.isBuffer(value), 'value must be string or buffer');
    var buf = Buffer.isBuffer(value) ? value : new Buffer(value, encoding || 'binary');
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
};

// Base64url (RFC 4648) decode

exports.base64urlDecode = function (value, encoding) {

    if (typeof value !== 'string') {

        throw new Error('Value not a string');
    }

    if (!/^[\w\-]*$/.test(value)) {

        throw new Error('Invalid character');
    }

    var buf = new Buffer(value, 'base64');
    return encoding === 'buffer' ? buf : buf.toString(encoding || 'binary');
};

// Escape attribute value for use in HTTP header

exports.escapeHeaderAttribute = function (attribute) {

    // Allowed value characters: !#$%&'()*+,-./:;<=>?@[]^_`{|}~ and space, a-z, A-Z, 0-9, \, "

    exports.assert(/^[ \w\!#\$%&'\(\)\*\+,\-\.\/\:;<\=>\?@\[\]\^`\{\|\}~\"\\]*$/.test(attribute), 'Bad attribute value (' + attribute + ')');

    return attribute.replace(/\\/g, '\\\\').replace(/\"/g, '\\"'); // Escape quotes and slash
};

exports.escapeHtml = function (string) {

    return Escape.escapeHtml(string);
};

exports.escapeJavaScript = function (string) {

    return Escape.escapeJavaScript(string);
};

exports.escapeJson = function (string) {

    return Escape.escapeJson(string);
};

exports.once = function (method) {

    if (method._hoekOnce) {
        return method;
    }

    var once = false;
    var wrapped = function wrapped() {

        if (!once) {
            once = true;

            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            method.apply(null, args);
        }
    };

    wrapped._hoekOnce = true;
    return wrapped;
};

exports.isInteger = _isSafeInteger2.default;

exports.ignore = function () {};

exports.inherits = Util.inherits;

exports.format = Util.format;

exports.transform = function (source, transform, options) {

    exports.assert(source === null || source === undefined || (typeof source === 'undefined' ? 'undefined' : (0, _typeof3.default)(source)) === 'object' || Array.isArray(source), 'Invalid source object: must be null, undefined, an object, or an array');
    var separator = (typeof options === 'undefined' ? 'undefined' : (0, _typeof3.default)(options)) === 'object' && options !== null ? options.separator || '.' : '.';

    if (Array.isArray(source)) {
        var results = [];
        for (var i = 0; i < source.length; ++i) {
            results.push(exports.transform(source[i], transform, options));
        }
        return results;
    }

    var result = {};
    var keys = (0, _keys2.default)(transform);

    for (var _i8 = 0; _i8 < keys.length; ++_i8) {
        var key = keys[_i8];
        var path = key.split(separator);
        var sourcePath = transform[key];

        exports.assert(typeof sourcePath === 'string', 'All mappings must be "." delineated strings');

        var segment = void 0;
        var res = result;

        while (path.length > 1) {
            segment = path.shift();
            if (!res[segment]) {
                res[segment] = {};
            }
            res = res[segment];
        }
        segment = path.shift();
        res[segment] = exports.reach(source, sourcePath, options);
    }

    return result;
};

exports.uniqueFilename = function (path, extension) {

    if (extension) {
        extension = extension[0] !== '.' ? '.' + extension : extension;
    } else {
        extension = '';
    }

    path = Path.resolve(path);
    var name = [Date.now(), process.pid, Crypto.randomBytes(8).toString('hex')].join('-') + extension;
    return Path.join(path, name);
};

exports.stringify = function () {

    try {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _stringify2.default.apply(null, args);
    } catch (err) {
        return '[Cannot display object: ' + err.message + ']';
    }
};

exports.shallow = function (source) {

    var target = {};
    var keys = (0, _keys2.default)(source);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        target[key] = source[key];
    }

    return target;
};

exports.wait = function (timeout) {

    return new _promise2.default(function (resolve) {
        return setTimeout(resolve, timeout);
    });
};

exports.block = function () {

    return new _promise2.default(exports.ignore);
};