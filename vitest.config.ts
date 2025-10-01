import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['test/*.ts'],
        setupFiles: ['vitest.setup.ts'],
        coverage: {
            enabled: true,
            provider: 'v8',
            all: true,
            thresholds: {
                functions: 100,
                lines: 100,
                branches: 100
            },
            reportsDirectory: './coverage',
            reporter: ['text', 'lcov'],
            exclude: [
                'eslint.config.cjs',
                'tsdown.config.ts',
                'vitest.config.ts',
                'test/**',
                'dist/**',
                '**/*.d.ts'
            ]
        }
    }
});
