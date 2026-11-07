---
'@graphql-codegen/typescript-graphql-apollo': major
---

Update `@graphql-codegen/plugin-helpers` and `@graphql-codegen/visitor-plugin-common` to v8. `validate` now reads `outputFile` from the `info` object passed as its fourth argument, so it requires `@graphql-codegen/cli` v8.

With the default `documentMode: graphQLTag`, a fragment document no longer interpolates the documents of the fragments it spreads. Each operation document now interpolates every fragment it uses, directly or through other fragments, once.

The `graphql` peer dependency range is now `^16.0.0 || ^17.0.0`, and `engines.node` is now `>=22.18.0`.
