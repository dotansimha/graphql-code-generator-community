import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../../../vitest.config.js';

const include = ['**/*.spec.ts'];
if (process.env.GRAPHQL_VERSION === '15') {
  include.push('!**/*.v16+.spec.ts');
}

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'typescript-jit-sdk',
      include,
    },
  }),
);
