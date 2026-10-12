---
'@graphql-codegen/typescript-graphql-request': major
---

Update GraphQL Codegen common packages to latest (`@graphql-codegen/visitor-plugin-common` v7). This changes the shape of generated documents: a fragment's `*Doc` no longer interpolates the fragments it spreads, and each operation document instead interpolates every fragment it transitively spreads. Generated output is equivalent, but any code or snapshot asserting on the previous interpolation layout needs updating. Also, `documentMode: 'string'` is now remapped to `'plainString'` with a console warning, because the `'string'` output referenced an undeclared `TypedDocumentString`. Documents are now typed as plain `string`; if you supplied `TypedDocumentString` yourself (e.g. via the `add` plugin) or relied on the `TypedDocumentString<Result, Variables>` type of exported documents, please check your setup. Set `documentMode: 'plainString'` to silence the warning.
