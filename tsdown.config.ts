import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['./lib/index.ts'],
    outDir: './dist',
    // clean:false — tsdown's default clean:true can resolve its target to the
    // project root and wipe the working tree (and, through a symlinked dep, that
    // dep's source). dist is managed explicitly instead.
    clean: false,
    // exports:false — do not let tsdown rewrite package.json on build.
    exports: false,
    // hash:false — emit a stable dist/index.d.ts so package.json `types` resolves
    // (the default emits dist/index-<hash>.d.ts, which `types` never points at).
    hash: false,
    format: 'esm',
    target: 'node22',
});
