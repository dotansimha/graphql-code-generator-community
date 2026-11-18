import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../../../vitest.config.js';

let include = ['**/*.v17.spec.ts'];
if (process.env.GRAPHQL_VERSION === '16') {
  include = ['**/*.v16.spec.ts'];
}

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'typescript-nhost',
      include,
    },
  }),
);
