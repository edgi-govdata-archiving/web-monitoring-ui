import { defineConfig } from 'eslint/config';
import react from 'eslint-plugin-react';
import globals from 'globals';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
  {
    ignores: ['scratch.*', 'dist/**/*', 'coverage/**/*'],
  },

  js.configs.recommended,

  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },

    plugins: {
      '@stylistic': stylistic,
    },

    rules: {
      '@stylistic/brace-style': [
        'error',
        'stroustrup',
        { allowSingleLine: true },
      ],
      // TODO: Turn this on! Codebase is pretty messy here, though.
      // '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/indent': [
        'error',
        2,
        { 'SwitchCase': 1 },
      ],
      '@stylistic/linebreak-style': [
        'error',
        'unix',
      ],
      '@stylistic/object-curly-spacing': [
        'error',
        'always',
      ],
      '@stylistic/quotes': [
        'error',
        'single',
        { 'avoidEscape': true },
      ],
      '@stylistic/semi': [
        'error',
        'always',
      ],
      '@stylistic/space-before-function-paren': [
        'error',
        'always',
      ],
      '@stylistic/space-infix-ops': ['error'],
      'no-unused-vars': [
        'error',
        // Allow functions to include the full signature of a protocol they adhere
        // to, even if they don’t use some args.
        { 'args': 'none' },
      ],
    },
  },

  {
    basePath: 'server',

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      'no-console': 'off',
    },
  },

  {
    basePath: 'src',

    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    plugins: {
      react,
    },

    // TODO: Consider using recommended React rules?
    extends: [
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
    ],

    rules: {
      // React has officially deprecated propTypes.
      'react/prop-types': 'off',
    },
  },

  {
    files: ['**/*.test.{js,jsx}'],

    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },

  // TODO: these files should be migrated to ESM, then we can set `type: module`
  //   in `package.json` and possibly remove this config block (at least remove
  //   `formatters.js` from it).
  {
    files: [
      '.bundlewatch.config.js',
      'webpack.config.js',
      'src/scripts/formatters.js',
    ],

    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
  },
]);
