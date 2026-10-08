---
'@graphql-codegen/near-operation-file-preset': patch
---

Fix missing imports for polymorphic fragments spread at the root of a fragment or operation.

`analyzeFragmentTypeUsage` only inspected fragment spreads nested inside fields, so a spread
like `fragment Card on Node { ...Title }` only imported the variants of `Title` that were also
used in a nested field, leaving the generated file with references to undeclared
`Title_<Type>_Fragment` types.
