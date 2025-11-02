import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const nextRules = nextPlugin.configs.recommended.rules ?? {};
const reactRules = reactPlugin.configs.recommended.rules ?? {};
const reactJsxRuntimeRules = reactPlugin.configs['jsx-runtime'].rules ?? {};
const reactHooksRules = reactHooksPlugin.configs.recommended.rules ?? {};

const tsFileGlobs = ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'];

const typeCheckedConfigs = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: config.files ?? tsFileGlobs,
  languageOptions: {
    ...config.languageOptions,
    parserOptions: {
      ...(config.languageOptions?.parserOptions ?? {}),
      project: ['./tsconfig.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
}));

export default tseslint.config(
  {
    ignores: ['.next/', 'node_modules/', '_dev/', '_devlogs/', 'pnpm-lock.yaml', '_devlogs/'],
  },
  js.configs.recommended,
  ...typeCheckedConfigs,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      next: {
        rootDir: ['.'],
      },
    },
    rules: {
      ...nextRules,
      ...reactRules,
      ...reactJsxRuntimeRules,
      ...reactHooksRules,
      'prettier/prettier': [
        'warn',
        {
          endOfLine: 'auto',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
);
