---
'@graphql-codegen/c-sharp': major
'@graphql-codegen/c-sharp-common': major
'@graphql-codegen/c-sharp-operations': major
'@graphql-codegen/flow': major
'@graphql-codegen/flow-operations': major
'@graphql-codegen/flow-resolvers': major
'@graphql-codegen/flutter-freezed': major
'@graphql-codegen/hasura-allow-list': major
'@graphql-codegen/import-types-preset': major
'@graphql-codegen/java': major
'@graphql-codegen/java-apollo-android': major
'@graphql-codegen/java-common': major
'@graphql-codegen/java-resolvers': major
'@graphql-codegen/jsdoc': major
'@graphql-codegen/kotlin': major
'@graphql-codegen/named-operations-object': major
'@graphql-codegen/near-operation-file-preset': major
'@graphql-codegen/python': major
'@graphql-codegen/python-common': major
'@graphql-codegen/python-operations': major
'@graphql-codegen/typescript-apollo-angular': major
'@graphql-codegen/typescript-apollo-client-helpers': major
'@graphql-codegen/typescript-enum-array': major
'@graphql-codegen/typescript-generic-sdk': major
'@graphql-codegen/typescript-graphql-apollo': major
'@graphql-codegen/typescript-graphql-files-modules': major
'@graphql-codegen/typescript-graphql-request': major
'@graphql-codegen/typescript-jit-sdk': major
'@graphql-codegen/typescript-mongodb': major
'@graphql-codegen/typescript-msw': major
'@graphql-codegen/typescript-nest': major
'@graphql-codegen/typescript-nhost': major
'@graphql-codegen/typescript-oclif': major
'@graphql-codegen/typescript-react-apollo': major
'@graphql-codegen/typescript-react-offix': major
'@graphql-codegen/typescript-react-query': major
'@graphql-codegen/typescript-rtk-query': major
'@graphql-codegen/typescript-solid-query': major
'@graphql-codegen/typescript-stencil-apollo': major
'@graphql-codegen/typescript-type-graphql': major
'@graphql-codegen/typescript-urql': major
'@graphql-codegen/typescript-urql-graphcache': major
'@graphql-codegen/typescript-vue-apollo': major
'@graphql-codegen/typescript-vue-apollo-smart-ops': major
'@graphql-codegen/typescript-vue-urql': major
'@graphql-codegen/urql-introspection': major
'@graphql-codegen/urql-svelte-operations-store': major
---

Upgrade the @graphql-codegen main packages to the latest versions. This is
a major version bump so some adjustments are required to the community plugins. We now require Node.js ^20.19.0 or >=22.12.0 for CommonJS consumers because the
updated dependency chain requires native ESM loading.
