import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../../../vitest.config.js';

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'typescript-type-graphql',
      // FIXME: skip graphql@17 until deps are fixed to handle v17
      include: process.env.GRAPHQL_VERSION === '17' ? [] : ['**/*.spec.ts'],
    },
  }),
);
