import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../../../vitest.config.js';

const include = ['**/*.spec.ts'];

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'typescript-generic-sdk',
      include,
    },
  }),
);
