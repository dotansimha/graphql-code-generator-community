---
"@graphql-codegen/typescript-urql-graphcache": patch
---

Fix scalar types in generated `GraphCacheUpdaters`, `GraphCacheOptimisticUpdaters`, and `GraphCacheResolvers` to use `Scalars['X']['output']` instead of `Scalars['X']`.
