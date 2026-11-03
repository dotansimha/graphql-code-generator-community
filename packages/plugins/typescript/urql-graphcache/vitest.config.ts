import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../../../vitest.config.js';

const graphqlPackage = JSON.parse(
  readFileSync(new URL('../../../../node_modules/graphql/package.json', import.meta.url), 'utf8'),
) as { version: string };
const graphqlEntry = fileURLToPath(
  new URL(
    `../../../../node_modules/graphql/index.${graphqlPackage.version.startsWith('17.') ? 'mjs' : 'js'}`,
    import.meta.url,
  ),
);

export default mergeConfig(
  sharedConfig,
  defineProject({
    resolve: {
      alias: {
        graphql: graphqlEntry,
      },
    },
    test: {
      name: 'typescript-urql-graphcache',
      include: ['**/*.spec.ts'],
      server: {
        deps: {
          inline: [/^@graphql-codegen\//],
        },
      },
    },
  }),
);
