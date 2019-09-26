
### Object

**hoek** provides several helpful methods for objects and arrays.

#### clone(obj, [options])

Clones an object or an array. A *deep copy* is made (duplicates everything, including values that are
objects, as well as non-enumerable properties) where:
- `obj` - the object to be cloned.
- `options` - optional settings:
    - `symbols` - clone symbol properties. Defaults to `false`.

```javascript

var nestedObj = {
        w: /^something$/ig,
        x: {
            a: [1, 2, 3],
            b: 123456,
            c: new Date()
        },
        y: 'y',
        z: new Date()
    };

var copy = Hoek.clone(nestedObj);

copy.x.b = 100;

console.log(copy.y);        // results in 'y'
console.log(nestedObj.x.b); // results in 123456
console.log(copy.x.b);      // results in 100
```

#### cloneWithShallow(obj, keys, [options])

Clones an object or array excluding some keys which are shallow copied where:
- `obj` - the object to be cloned.
- `keys` - an array of key names to shallow copy.
- `options` - optional settings:
    - `symbols` - clone symbol properties. Defaults to `false`.

```javascript

var nestedObj = {
        w: /^something$/ig,
        x: {
            a: [1, 2, 3],
            b: 123456,
            c: new Date()
        },
        y: 'y',
        z: new Date()
    };

var copy = Hoek.cloneWithShallow(nestedObj, ['x']);

copy.x.b = 100;

console.log(copy.y);        // results in 'y'
console.log(nestedObj.x.b); // results in 100
console.log(copy.x.b);      // results in 100
```

#### merge(target, source, isNullOverride, isMergeArrays)
isNullOverride, isMergeArrays default to true

Merge all the properties of source into target, source wins in conflict, and by default null and undefined from source are applied.
Merge is destructive where the target is modified. For non destructive merge, use `applyToDefaults`.


```javascript

var target = {a: 1, b : 2};
var source = {a: 0, c: 5};
var source2 = {a: null, c: 5};

Hoek.merge(target, source);         // results in {a: 0, b: 2, c: 5}
Hoek.merge(target, source2);        // results in {a: null, b: 2, c: 5}
Hoek.merge(target, source2, false); // results in {a: 1, b: 2, c: 5}

var targetArray = [1, 2, 3];
var sourceArray = [4, 5];

Hoek.merge(targetArray, sourceArray);              // results in [1, 2, 3, 4, 5]
Hoek.merge(targetArray, sourceArray, true, false); // results in [4, 5]
```

#### applyToDefaults(defaults, options, isNullOverride)
isNullOverride defaults to false

Apply options to a copy of the defaults

```javascript

var defaults = { host: "localhost", port: 8000 };
var options = { port: 8080 };

var config = Hoek.applyToDefaults(defaults, options); // results in { host: "localhost", port: 8080 }
```

Apply options with a null value to a copy of the defaults

```javascript

var defaults = { host: "localhost", port: 8000 };
var options = { host: null, port: 8080 };

var config = Hoek.applyToDefaults(defaults, options, true); // results in { host: null, port: 8080 }
```

#### applyToDefaultsWithShallow(defaults, options, keys)
keys is an array of dot-separated, or array-based, key paths to shallow copy

Apply options to a copy of the defaults. Keys specified in the last parameter are shallow copied from options instead of merged.

```javascript

var defaults = {
    db: {
        server: {
            host: "localhost",
            port: 8000
        },
        name: 'example'
    }
};

var options = { server: { port: 8080 } };

var config = Hoek.applyToDefaultsWithShallow(defaults, options, ['db.server']); // results in { db: { server: { port: 8080 }, name: 'example' } }
var config = Hoek.applyToDefaultsWithShallow(defaults, options, [['db', 'server']]); // results in { db: { server: { port: 8080 }, name: 'example' } }
```

#### deepEqual(b, a, [options])

Performs a deep comparison of the two values including support for circular dependencies, prototype, and enumerable properties.
To skip prototype comparisons, use `options.prototype = false` and to include symbols, used `options.symbols = true`.

```javascript
Hoek.deepEqual({ a: [1, 2], b: 'string', c: { d: true } }, { a: [1, 2], b: 'string', c: { d: true } }); //results in true
Hoek.deepEqual(Object.create(null), {}, { prototype: false }); //results in true
Hoek.deepEqual(Object.create(null), {}); //results in false
```

#### intersect(array1, array2)

Find the common unique items in two arrays

```javascript

var array1 = [1, 2, 3];
var array2 = [1, 4, 5];

var newArray = Hoek.intersect(array1, array2); // results in [1]
```

#### contain(ref, values, [options])

Tests if the reference value contains the provided values where:
- `ref` - the reference string, array, or object.
- `values` - a single or array of values to find within the `ref` value. If `ref` is an object, `values` can be a key name,
  an array of key names, or an object with key-value pairs to compare.
- `options` - an optional object with the following optional settings:
    - `deep` - if `true`, performed a deep comparison of the values.
    - `once` - if `true`, allows only one occurrence of each value.
    - `only` - if `true`, does not allow values not explicitly listed.
    - `part` - if `true`, allows partial match of the values (at least one must always match).

Note: comparing a string to overlapping values will result in failed comparison (e.g. `contain('abc', ['ab', 'bc'])`).
Also, if an object key's value does not match the provided value, `false` is returned even when `part` is specified.

```javascript
Hoek.contain('aaa', 'a', { only: true });							// true
Hoek.contain([{ a: 1 }], [{ a: 1 }], { deep: true });				// true
Hoek.contain([1, 2, 2], [1, 2], { once: true });					// false
Hoek.contain({ a: 1, b: 2, c: 3 }, { a: 1, d: 4 }, { part: true }); // true
```

#### flatten(array, [target])

Flatten an array

```javascript

var array = [1, [2, 3]];

var flattenedArray = Hoek.flatten(array); // results in [1, 2, 3]

array = [1, [2, 3]];
target = [4, [5]];

flattenedArray = Hoek.flatten(array, target); // results in [4, [5], 1, 2, 3]
```

#### reach(obj, chain, [options])

Converts an object key chain string or array to reference

- `options` - optional settings
    - `separator` - string to split chain path on, defaults to '.'
    - `default` - value to return if the path or value is not present, default is `undefined`
    - `strict` - if `true`, will throw an error on missing member, default is `false`
    - `functions` - if `true` allow traversing functions for properties. `false` will throw an error if a function is part of the chain.

A chain can be a string that will be split into key names using `separator`,
or an array containing each individual key name.

A chain including negative numbers will work like negative indices on an array.

If chain is `null`, `undefined` or `false`, the object itself will be returned.

```javascript

var chain = 'a.b.c';
var obj = {a : {b : { c : 1}}};

Hoek.reach(obj, chain); // returns 1

var chain = ['a', 'b', -1];
var obj = {a : {b : [2,3,6]}};

Hoek.reach(obj, chain); // returns 6
```

#### reachTemplate(obj, template, [options])

Replaces string parameters (`{name}`) with their corresponding object key values by applying the
[`reach()`](#reachobj-chain-options) method where:

- `obj` - the context object used for key lookup.
- `template` - a string containing `{}` parameters.
- `options` - optional [`reach()`](#reachobj-chain-options) options.

```javascript

var chain = 'a.b.c';
var obj = {a : {b : { c : 1}}};

Hoek.reachTemplate(obj, '1+{a.b.c}=2'); // returns '1+1=2'
```

#### stringify(...args)

Converts an object to string using the built-in `JSON.stringify()` method with the difference that any errors are caught
and reported back in the form of the returned string. Used as a shortcut for displaying information to the console (e.g. in
error message) without the need to worry about invalid conversion.

```javascript
var a = {};
a.b = a;
Hoek.stringify(a);		// Returns '[Cannot display object: Converting circular structure to JSON]'
```

### Bench

Same as Timer with the exception that `ts` stores the internal node clock which is not related to `Date.now()` and cannot be used to display
human-readable timestamps. More accurate for benchmarking or internal timers.

### Escaping Characters

**hoek** provides convenient methods for escaping html characters. The escaped characters are as followed:

```javascript

internals.htmlEscaped = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
};
```

#### escapeHtml(string)

```javascript

var string = '<html> hey </html>';
var escapedString = Hoek.escapeHtml(string); // returns &lt;html&gt; hey &lt;/html&gt;
```

#### escapeHeaderAttribute(attribute)

Escape attribute value for use in HTTP header

```javascript

var a = Hoek.escapeHeaderAttribute('I said "go w\\o me"');  //returns I said \"go w\\o me\"
```

#### escapeJson(string)

Unicode escapes the characters `<`, `>`, and `&` to prevent mime-sniffing older browsers mistaking JSON as HTML, and escapes line and paragraph separators for JSONP and script contexts.

```javascript

var lineSeparator = String.fromCharCode(0x2028);
var a = Hoek.escapeJson('I said <script>confirm(&).' + lineSeparator);  //returns I said \\u003cscript\\u003econfirm(\\u0026).\\u2028
```

#### escapeRegex(string)

Escape string for Regex construction

```javascript

var a = Hoek.escapeRegex('4^f$s.4*5+-_?%=#!:@|~\\/`"(>)[<]d{}s,');  // returns 4\^f\$s\.4\*5\+\-_\?%\=#\!\:@\|~\\\/`"\(>\)\[<\]d\{\}s\,
```

### Errors

#### assert(condition, message)

```javascript

var a = 1, b = 2;

Hoek.assert(a === b, 'a should equal b');  // Throws 'a should equal b'
```

Note that you may also pass an already created Error object as the second parameter, and `assert` will throw that object.

```javascript

var a = 1, b = 2;

Hoek.assert(a === b, new Error('a should equal b')); // Throws the given error object
```

### Function

#### once(fn)

Returns a new function that can be run multiple times, but makes sure `fn` is only run once.

```javascript

var myFn = function () {
    console.log('Ran myFn');
};

var onceFn = Hoek.once(myFn);
onceFn(); // results in "Ran myFn"
onceFn(); // results in undefined
```

#### ignore

A simple no-op function. It does nothing at all.

### Miscellaneous

#### uniqueFilename(path, extension)
`path` to prepend with the randomly generated file name. `extension` is the optional file extension, defaults to `''`.

Returns a randomly generated file name at the specified `path`. The result is a fully resolved path to a file.

```javascript
var result = Hoek.uniqueFilename('./test/modules', 'txt'); // results in "full/path/test/modules/{random}.txt"
```

### Promises

#### wait(timeout)
Resolve the promise after `timeout`. Provide the `timeout` in milliseconds.

```javascript
await Hoek.wait(2000); // waits for 2 seconds
```

#### block()
A no-op Promise. Does nothing.
