import HapiRecommended from '@hapi/oxc-plugin/oxlint';
import { defineConfig } from 'oxlint';

export default defineConfig({
    extends: [HapiRecommended],
    env: {
        ...HapiRecommended.env,
    },
});
