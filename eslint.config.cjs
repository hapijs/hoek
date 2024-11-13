'use strict';

const HapiPlugin = require('@hapi/eslint-plugin');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
    {
        files: ['**/*.ts', '**/*.cjs', '**/*.js']
    },
    ...HapiPlugin.configs.module,
    ...tseslint.configs.recommended
);
