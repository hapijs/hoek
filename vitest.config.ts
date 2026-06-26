import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['test/**/*.ts'],
        setupFiles: ['vitest.setup.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**'],
            thresholds: {
                functions: 100,
                lines: 100,
                branches: 100,
                statements: 100,
            },
        },
    },
});
