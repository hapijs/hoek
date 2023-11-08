import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['./src/index.ts'],
    outDir: './dist',
    // clean:true — matches tlds; wipes dist so no stale .js/.d.ts from a prior build
    // linger. Safe here: outDir is scoped to ./dist and the oxc-plugin symlink (which
    // amplified the old working-tree-wipe incident) is gone — deps now come from npm.
    clean: true,
    // exports:true — let tsdown generate the package.json exports map and emit the
    // unambiguous `.mjs` output, matching the tlds single-export + types shape.
    exports: true,
    // hash:false — stable dist/index.mjs + dist/index.d.mts filenames.
    hash: false,
    format: 'esm',
    target: 'node22',
});
