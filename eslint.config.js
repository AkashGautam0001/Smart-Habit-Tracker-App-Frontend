import js           from '@eslint/js';
import tseslint     from 'typescript-eslint';
import reactHooks   from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals      from 'globals';

export default tseslint.config(
  // Global ignores
  { ignores: ['dist/**', 'node_modules/**'] },

  // Base JS recommended
  js.configs.recommended,

  // TypeScript recommended (no type-checking pass — keeps lint fast)
  ...tseslint.configs.recommended,

  // Browser + ES2022 globals, React plugin rules
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks':   reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2022 },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // React hooks
      ...reactHooks.configs.recommended.rules,
      // Reset-on-open and navigation-sync patterns are valid; downgrade to warn
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs':                'warn',

      // HMR safety
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // TypeScript
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any':      'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // General quality
      'no-console':  ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var':       'error',
    },
  },
);
