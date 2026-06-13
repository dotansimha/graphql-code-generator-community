import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../../../vitest.config.js';

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'typescript-react-query',
      include: ['**/*.spec.ts'],
      setupFiles: './vitest.setup.ts',
    },
  }),
);
