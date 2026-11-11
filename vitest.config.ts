import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export const sharedConfig = defineConfig({
  resolve: {
    alias: {
      graphql: require.resolve('graphql'),
    },
    tsconfigPaths: true,
  },
  test: {
    globals: true,
  },
});

export default defineConfig({
  test: {
    projects: ['packages/**/vitest.config.ts'],
  },
});
