import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // hooks: { afterAllFileWrite: ['prettier --write'] },
  emitLegacyCommonJSImports: false,
  generates: {
    './dev-test/star-wars/types.graceful-graphql-interfaces.tsx': {
      schema: './dev-test/star-wars/schema.json',
      config: { forEntities: ['Character'] },
      documents: './dev-test/star-wars/**/*.graphql',
      plugins: ['typescript-graceful-graphql-interfaces'],
    },
  },
};

export default config;
