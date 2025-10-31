import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...ts.configs.stylistic,
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'],
  prettier,
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        extraFileExtensions: ['.svelte']
      }
    },
    rules: {
      'svelte/no-at-html-tags': 'error'
    }
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  }
);
