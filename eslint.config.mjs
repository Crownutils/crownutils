import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', 'prisma/generated/'],
  },

  eslint.configs.recommended,

  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  // Layer boundary: `core/` is pure domain and must never depend on the
  // presentation layer (discord.js or `@/discord/*`). Enforced, not trusted.
  {
    files: ['src/core/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/discord', '@/discord/**', '**/discord/**'],
              message: 'core/ must not depend on the discord layer.',
            },
            {
              group: ['discord.js'],
              message: 'core/ must stay free of discord.js.',
            },
          ],
        },
      ],
    },
  },

  // Config is the single place allowed to read process.env; everywhere else
  // must go through @/core/config so env is loaded and validated exactly once.
  {
    files: ['src/**/*.ts'],
    ignores: ['src/core/config/**'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message: 'Read config via @/core/config, not process.env directly.',
        },
      ],
    },
  },

  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  prettier,
);
