import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import path from 'path';
import tseslint from 'typescript-eslint';

export default defineConfig([
  //globalIgnores(['frontend/dist']),
  {
    ignores: ['**/dist', '**/node_modules']
  },
  //frontend
  {
    files: ['frontend/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: [
          './frontend/tsconfig.app.json',
          './frontend/tsconfig.node.json'
        ],
        tsconfigRootDir: path.resolve('./'),
      },
    },
    rules: {
      quotes: ['error', 'single'],
      'jsx-quotes': ['error', 'prefer-double'],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@mui/material',
              message:
                "Importing from the root of @mui/material is disallowed. Use deep imports like '@mui/material/Button' instead.",
            },
            {
              name: '@mui/icons-material',
              message:
                "Importing from the root of @mui/icons-material is disallowed. Use deep imports like '@mui/icons-material/Star' instead.",
            },
          ],
        },
      ],
    },
  },
  //backend
  {
    files: ['backend/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        project: ['./backend/tsconfig.json'],
        tsconfigRootDir: path.resolve('./'),
      },
    },
    rules: {
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true },
      ],
    },
  },
  //shared
  {
    files: ['shared/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true },
      ],
    },
  },
]);
