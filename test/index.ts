import * as Hoek from '..';
import * as Lab from '@hapi/lab';


const { expect } = Lab.types;


interface Foo {
    a?: number;
    b?: string;
};

interface Bar {
    b?: string;
    c?: boolean;
};


// deepEqual()

Hoek.deepEqual('some', 'some');
Hoek.deepEqual('some', 3);
Hoek.deepEqual({}, {});
Hoek.deepEqual({}, {}, { prototype: false, symbols: true, part: false });

expect.type<boolean>(Hoek.deepEqual(1, 2));

expect.error(Hoek.deepEqual());
expect.error(Hoek.deepEqual(1, 2, {}, 'x'));
expect.error(Hoek.deepEqual({}, {}, { unknown: true }));


// clone()

Hoek.clone('string');
Hoek.clone(123);
Hoek.clone({ a: 1 });
Hoek.clone({ a: 1 }, { prototype: true, symbols: true });
Hoek.clone({}, { shallow: [] });
Hoek.clone(1, { shallow: [] });
Hoek.clone(null, { shallow: [] });
Hoek.clone({ a: 1, b: { c: [2] } }, { shallow: ['b'] });
Hoek.clone({ a: 1, b: { c: [2] } }, { shallow: [['b']] });
Hoek.clone({ a: 1, b: { c: [2] } }, { shallow: ['b'], prototype: true, symbols: true });

expect.type<string>(Hoek.clone('string'));
expect.type<object>(Hoek.clone({}));
expect.type<Bar>(Hoek.clone({} as Bar));
expect.type<Foo>(Hoek.clone({ a: 1 } as Foo, { shallow: ['b'] }));

expect.error(Hoek.clone({}, { unknown: true }));
expect.error(Hoek.clone({}, { shallow: [1] }));
expect.error(Hoek.clone({}, { shallow: 1 }));


// merge()

Hoek.merge({ a: 1 } as Foo, { b: 'x' } as Bar);
Hoek.merge({ a: 1 }, { a: null });
Hoek.merge({ a: 1 }, { a: null }, { mergeArrays: true, nullOverride: true, symbols: false });

expect.type<object>(Hoek.merge({}, {}));
expect.type<Foo & Bar>(Hoek.merge({ a: 1 } as Foo, { b: 'x' } as Bar));

expect.error(Hoek.merge(1, 2));
expect.error(Hoek.merge({ a: 1 }, { a: null }, true));
expect.error(Hoek.merge({ a: 1 }, { a: null }, { unknown: true }));


// applyToDefaults()

Hoek.applyToDefaults({}, {});
Hoek.applyToDefaults({}, true);
Hoek.applyToDefaults({}, false);
Hoek.applyToDefaults({}, null);
Hoek.applyToDefaults({ a: 1 } as Foo, { b: 'x' });
Hoek.applyToDefaults({ a: 1 } as object, { b: 'x' });
Hoek.applyToDefaults({ a: 1 } as Foo, { b: 'x' }, { shallow: ['b'] });
Hoek.applyToDefaults({ a: 1 } as object, { b: 'x' }, { shallow: ['c'] });

expect.type<object>(Hoek.applyToDefaults({}, {}));
expect.type<Foo>(Hoek.applyToDefaults({ a: 1 } as Foo, { b: 'x' }));
expect.type<object>(Hoek.applyToDefaults({}, {}, { shallow: [] }));

expect.error(Hoek.applyToDefaults({} as Foo, 0));
expect.error(Hoek.applyToDefaults({} as Foo, 0, { shallow: [] }));


// intersect()

Hoek.intersect([1], [1, 2]);
Hoek.intersect(['a'], ['b', 'b']);
Hoek.intersect([1], [1, 2], { first: true });
Hoek.intersect([1], [1, 2], { first: false });
Hoek.intersect([1], null);
Hoek.intersect(null, [1, 2]);
Hoek.intersect([1], null, { first: true });
Hoek.intersect(null, [1, 2], { first: true });
Hoek.intersect(new Set([1]), new Set([1, 2]));
Hoek.intersect([1], new Set([1, 2]));
Hoek.intersect(new Set([1]), [1, 2]);

expect.type<any[]>(Hoek.intersect([1], [1, 2]));
expect.type<any[]>(Hoek.intersect([1], [1, 2], { first: false }));
expect.type<any>(Hoek.intersect([1], [1, 2], { first: true }));

expect.error(Hoek.intersect());
expect.error(Hoek.intersect(1, 2));
expect.error(Hoek.intersect([1], 2));
expect.error(Hoek.intersect([1], [2], 'x'));
expect.error(Hoek.intersect(new Map(), [2]));


// contain()

Hoek.contain('abc', 'a');
Hoek.contain('abc', ['a', 'x']);
Hoek.contain('abc', ['a', 'd'], { once: true, part: true, deep: true, symbols: true, only: true });
Hoek.contain({ a: 1 }, 'a');
Hoek.contain({ a: 1 }, { a: 1 });
Hoek.contain({ a: 1, b: 2 }, ['a', 'x'], { once: true, part: true, deep: true, symbols: true, only: true });
Hoek.contain([1], 1);
Hoek.contain([1], [1]);
Hoek.contain([1], [1], { once: true, part: true, deep: true, symbols: true, only: true });

expect.type<boolean>(Hoek.contain('abc', 'a'));
expect.type<boolean>(Hoek.contain({ a: 1 }, 'a'));
expect.type<boolean>(Hoek.contain([1], 1));

expect.error(Hoek.contain('abc', 'a', { unknown: true }));
expect.error(Hoek.contain(['a'], 'a', { unknown: true }));
expect.error(Hoek.contain({ a: 1 }, 'a', { unknown: true }));
expect.error(Hoek.contain('abc', 1));
expect.error(Hoek.contain('abc', [1]));
expect.error(Hoek.contain('abc', [{}]));
expect.error(Hoek.contain('abc', {}));
expect.error(Hoek.contain({}, 1));


// flatten()

Hoek.flatten([1, [2, 3]]);
Hoek.flatten([1, [2, 3]], [4, 5]);

expect.type<any[]>(Hoek.flatten([1, [2, 3]]));
expect.type<any[]>(Hoek.flatten([1, [2, 3]], []));

expect.error(Hoek.flatten());
expect.error(Hoek.flatten(1));
expect.error(Hoek.flatten([], 1));


// reach()

Hoek.reach(null, false);
Hoek.reach(null, '0');
Hoek.reach(null, ['0']);
Hoek.reach(['abc'], false);
Hoek.reach(['abc'], null);
Hoek.reach(['abc'], undefined);
Hoek.reach(['abc'], [0]);
Hoek.reach(['abc'], ['0']);
Hoek.reach(['abc'], '0');
Hoek.reach({ a: { b: { c: 3 } } }, 'a.b.c');
Hoek.reach({ a: { b: { c: 3 } } }, ['a', 'b', 'c']);
Hoek.reach({ a: { b: { c: 3 } } }, 'a/b/c', { separator: '/', default: 4, strict: true, functions: true });

expect.type<any>(Hoek.reach(['abc'], [0]));
expect.type<any>(Hoek.reach({ a: { b: { c: 3 } } }, 'a.b.c'));

expect.error(Hoek.reach());
expect.error(Hoek.reach([]));
expect.error(Hoek.reach(1, '0'));
expect.error(Hoek.reach('abc', '0'));
expect.error(Hoek.reach([0], 0));
expect.error(Hoek.reach(['abc'], '0', { unknown: false }));
expect.error(Hoek.reach(['abc'], '0', { separator: false }));


// reachTemplate()

Hoek.reachTemplate(null, 'a{b}c');
Hoek.reachTemplate([1, 2], 'a{1}c');
Hoek.reachTemplate({ b: 2 }, 'a{b}c');
Hoek.reachTemplate({ a: { b: { c: 3 } } }, '{a/b/c}', { separator: '/', default: 4, strict: true, functions: true });

expect.type<string>(Hoek.reachTemplate([1, 2], 'a{1}c'));

expect.error(Hoek.reachTemplate());
expect.error(Hoek.reachTemplate([]));
expect.error(Hoek.reachTemplate(1, '0'));
expect.error(Hoek.reachTemplate('abc', '0'));
expect.error(Hoek.reachTemplate([0], 0));
expect.error(Hoek.reachTemplate(['abc'], '{0}', { unknown: false }));
expect.error(Hoek.reachTemplate(['abc'], '{0}', { separator: false }));


// assert()

Hoek.assert(true);
Hoek.assert(true, 'some', 'message', 10);
Hoek.assert(1, 'error');
Hoek.assert(true, new Error('message'));

expect.type<void>(Hoek.assert(true));


// Bench

const bench = new Hoek.Bench();
expect.type<number>(bench.ts);
expect.type<void>(bench.reset());
expect.type<number>(bench.elapsed());
expect.type<number>(Hoek.Bench.now());

expect.error(new Hoek.Bench({}));
expect.error(bench.reset(true));
expect.error(bench.elapsed(true));
expect.error(Hoek.Bench.now(true));


// escapeRegex()

Hoek.escapeRegex('something?');

expect.type<string>(Hoek.escapeRegex('^?'));

expect.error(Hoek.escapeRegex());
expect.error(Hoek.escapeRegex(true));
expect.error(Hoek.escapeRegex({}));


// escapeHeaderAttribute()

Hoek.escapeHeaderAttribute('something?');

expect.type<string>(Hoek.escapeHeaderAttribute('^?'));

expect.error(Hoek.escapeHeaderAttribute());
expect.error(Hoek.escapeHeaderAttribute(true));
expect.error(Hoek.escapeHeaderAttribute({}));


// escapeHtml()

Hoek.escapeHtml('something?');

expect.type<string>(Hoek.escapeHtml('^?'));

expect.error(Hoek.escapeHtml());
expect.error(Hoek.escapeHtml(true));
expect.error(Hoek.escapeHtml({}));


// escapeJson()

Hoek.escapeJson('something?');

expect.type<string>(Hoek.escapeJson('^?'));

expect.error(Hoek.escapeJson());
expect.error(Hoek.escapeJson(true));
expect.error(Hoek.escapeJson({}));


// once()

Hoek.once(() => 4);
Hoek.once(() => undefined);

expect.type<() => void>(Hoek.once(() => 'x'));

expect.error(Hoek.once());
expect.error(Hoek.once('x'));
expect.error(Hoek.once({}));


// ignore()

Hoek.ignore();
Hoek.ignore(1, 2, 'x');

expect.type<() => void>(Hoek.ignore);
expect.type<void>(Hoek.ignore());


// uniqueFilename()

Hoek.uniqueFilename('/root');
Hoek.uniqueFilename('/root', '.txt');

expect.type<string>(Hoek.uniqueFilename('/root'));

expect.error(Hoek.uniqueFilename());
expect.error(Hoek.uniqueFilename(123));
expect.error(Hoek.uniqueFilename('x', 123));
expect.error(Hoek.uniqueFilename('x', 'x', true));


// stringify()

Hoek.stringify(123);
Hoek.stringify({}, null, 4);

expect.type<string>(Hoek.stringify(123));

expect.error(Hoek.stringify());


// wait()

Hoek.wait();
Hoek.wait(123);

expect.type<Promise<void>>(Hoek.wait());
expect.type<void>(await Hoek.wait(100));

expect.error(Hoek.wait({}));


// block()

Hoek.wait();

expect.type<Promise<void>>(Hoek.block());
expect.type<void>(await Hoek.block());

expect.error(Hoek.block(123));
