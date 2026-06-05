import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['./lib/index.ts'],
    outDir: './dist',
    exports: true,
    format: 'esm',
    target: 'node22',
});
