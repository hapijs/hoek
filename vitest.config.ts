import Oxc from '@hapi/oxc-plugin/vitest';
import { defineConfig } from 'vitest/config';

import type { ViteUserConfig } from 'vitest/config';

export default defineConfig({
    plugins: [Oxc()],
    test: {
        environment: 'node',
        include: ['test/**/*.ts'],
        setupFiles: ['vitest.setup.ts'],
        typecheck: {
            enabled: true,
            include: ['test/**/*.{js,ts}'],
        },
        coverage: {
            provider: 'v8',
            include: ['src/**'],
            thresholds: {
                100: true,
            },
        },
    },
}) as ViteUserConfig;
