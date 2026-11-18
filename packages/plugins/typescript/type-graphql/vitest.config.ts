import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../../../vitest.config.js';

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'typescript-type-graphql',
      // Only run with GRAPHQL_VERSION=16: the @graphql-codegen/typescript@2 and visitor-plugin-common@2 dependencies crash on graphql 17.
      include: process.env.GRAPHQL_VERSION === '16' ? ['**/*.spec.ts'] : [],
    },
  }),
);
