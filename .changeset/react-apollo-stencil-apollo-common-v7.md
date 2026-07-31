---
'@graphql-codegen/typescript-react-apollo': major
'@graphql-codegen/typescript-stencil-apollo': major
---

Update GraphQL Codegen common packages to latest (`@graphql-codegen/visitor-plugin-common` v7).

This changes the shape of generated documents: a fragment's `*Doc` no longer interpolates the
fragments it spreads, and each operation document instead interpolates every fragment it
transitively spreads. Generated output is equivalent, but any code or snapshot asserting on the
previous interpolation layout needs updating.
