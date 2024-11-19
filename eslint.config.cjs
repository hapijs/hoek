/* eslint-disable @typescript-eslint/no-require-imports */

const HapiPlugin = require('@hapi/eslint-plugin');
const TsEslint = require('typescript-eslint');

module.exports = TsEslint.config(
    {
        files: ['**/*.ts', '**/*.cjs', '**/*.js']
    },
    ...HapiPlugin.configs.module,
    ...TsEslint.configs.recommended,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            'func-style': 'off'
        }
    }
);
