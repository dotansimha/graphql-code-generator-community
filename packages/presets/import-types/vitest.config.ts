import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../../vitest.config.js';

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'import-types-preset',
      include: ['**/*.spec.ts'],
    },
  }),
);
