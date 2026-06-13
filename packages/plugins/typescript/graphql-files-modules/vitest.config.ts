import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../../../vitest.config.js';

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'typescript-graphql-files-modules',
      include: ['**/*.spec.ts'],
      setupFiles: './vitest.setup.ts',
    },
  }),
);
