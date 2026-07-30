import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['./src/index.ts'],
    outDir: './dist',
    clean: true,
    exports: true,
    hash: false,
    format: 'esm',
    target: 'node22',
});
