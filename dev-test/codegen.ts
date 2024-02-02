import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  hooks: { afterAllFileWrite: ['prettier --write'] },
  emitLegacyCommonJSImports: false,
  generates: {
    './dev-test/test-schema/flow-types.flow.js': {
      schema: './dev-test/test-schema/schema.json',
      plugins: ['flow', 'flow-resolvers'],
    },
    './dev-test/githunt/graphql-declared-modules.d.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: ['./dev-test/githunt/**/*.graphql'],
      plugins: ['typescript-graphql-files-modules'],
    },
    './dev-test/githunt/flow.flow.js': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      plugins: ['flow', 'flow-operations'],
    },
    './dev-test/githunt/types.reactApollo.tsx': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
    },
    './dev-test/githunt/types.reactApollo.v2.tsx': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      config: { reactApolloVersion: 2 },
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
    },
    './dev-test/githunt/types.reactApollo.customSuffix.tsx': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      config: { operationResultSuffix: 'MyOperation' },
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
    },
    './dev-test/githunt/types.reactApollo.preResolveTypes.tsx': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      config: { preResolveTypes: true },
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
    },
    './dev-test/githunt/types.reactApollo.hooks.tsx': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      plugins: [
        'typescript',
        'typescript-operations',
        {
          'typescript-react-apollo': {
            withFragmentHooks: true,
          },
        },
      ],
    },
    './dev-test/githunt/types.react-query.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      plugins: ['typescript', 'typescript-operations', 'typescript-react-query'],
      config: { addInfiniteQuery: true },
    },
    './dev-test/githunt/types.rtk-query.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      plugins: [
        { add: { content: 'module.hot?.accept();' } },
        'typescript',
        'typescript-operations',
        {
          'typescript-rtk-query': {
            importBaseApiFrom: '../../packages/plugins/typescript/rtk-query/tests/baseApi',
            exportHooks: true,
            overrideExisting: 'module.hot?.status() === "apply"',
          },
        },
      ],
    },
    './dev-test/githunt/types.apolloAngular.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      plugins: ['typescript', 'typescript-operations', 'typescript-apollo-angular'],
    },
    './dev-test/githunt/types.apolloAngular.sdk.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      config: { sdkClass: true },
      plugins: ['typescript', 'typescript-operations', 'typescript-apollo-angular'],
    },
    './dev-test/githunt/types.stencilApollo.tsx': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      plugins: ['typescript', 'typescript-operations', 'typescript-stencil-apollo'],
    },
    './dev-test/githunt/types.urql.tsx': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-urql',
        'urql-introspection',
        'typescript-urql-graphcache',
      ],
    },
    './dev-test/githunt': {
      schema: './dev-test/githunt/schema.json',
      documents: [
        './dev-test/githunt/**/*.graphql',
        './dev-test/githunt-invalid/**/*.graphql',
        '!./dev-test/githunt-invalid/**/*.graphql',
      ],
      preset: 'near-operation-file',
      presetConfig: {
        extension: '.stencil-component.tsx',
        folder: '__generated__',
        baseTypesPath: 'types.d.ts',
      },
      plugins: ['typescript-operations', 'typescript-stencil-apollo'],
      config: { componentType: 'class', globalNamespace: true },
    },
    './dev-test/githunt/types.vueApollo.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      plugins: ['typescript', 'typescript-operations', 'typescript-vue-apollo'],
    },
    './dev-test/githunt/types.vueApolloSmartOps.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      plugins: ['typescript', 'typescript-operations', 'typescript-vue-apollo-smart-ops'],
    },
    './dev-test/githunt/jit-sdk.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      plugins: ['typescript', 'typescript-operations', 'typescript-jit-sdk'],
    },
    './dev-test/star-wars': {
      schema: './dev-test/star-wars/schema.json',
      documents: './dev-test/star-wars/**/*.graphql',
      preset: 'near-operation-file',
      presetConfig: { extension: '.tsx', folder: '__generated__', baseTypesPath: 'types.d.ts' },
      plugins: ['typescript-operations', 'typescript-react-apollo'],
    },
    './dev-test/star-wars/types.refetchFn.tsx': {
      schema: './dev-test/star-wars/schema.json',
      documents: './dev-test/star-wars/**/*.graphql',
      plugins: ['typescript', 'typescript-react-apollo'],
      config: { withRefetchFn: true },
    },
    './dev-test/test-message/types.tsx': {
      schema: './dev-test/test-message/schema.graphql',
      documents: './dev-test/test-message/documents.ts',
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        documentMode: 'external',
        importDocumentNodeExternallyFrom: './documents.ts',
        reactApolloVersion: 3,
        gqlImport: 'graphql-tag',
        hooksImportFrom: '@apollo/react-hooks',
        withMutationFn: false,
      },
    },
  },
};

export default config;
