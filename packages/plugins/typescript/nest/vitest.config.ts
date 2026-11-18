import { versionInfo } from 'graphql';
import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../../../vitest.config.js';

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'typescript-nest',
      // Only run on graphql 16: the @graphql-codegen/typescript@2 and visitor-plugin-common@2 dependencies crash on graphql 17.
      include: versionInfo.major === 16 ? ['**/*.spec.ts'] : [],
    },
  }),
);
