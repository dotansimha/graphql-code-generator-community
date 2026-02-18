---
'@graphql-codegen/typescript-react-query': patch
'@graphql-codegen/typescript-solid-query': patch
---

Query keys should be shared between suspense and non-suspense hooks to ensure consistent state
management and synchronization, preventing discrepancies and maintaining a single source of truth
for query invalidation.
