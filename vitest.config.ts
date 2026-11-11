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
    // On GraphQL v17, a `<spec>.v17.snap` file next to the default snapshot file takes its place.
    resolveSnapshotPath: (testPath, snapExtension) => {
      const defaultPath = path.join(
        path.dirname(testPath),
        '__snapshots__',
        `${path.basename(testPath)}${snapExtension}`,
      );
      const v17Path = defaultPath.replace(/\.snap$/, '.v17.snap');
      if (process.env.GRAPHQL_VERSION === '17' && fs.existsSync(v17Path)) {
        return v17Path;
      }
      return defaultPath;
    },
  },
});
