---
'@graphql-codegen/near-operation-file-preset': patch
---

Fix fragment `*Doc` imports for transitively-nested fragments in `documentMode: graphQLTag`.

Since `visitor-plugin-common` v7, a `graphQLTag` operation inlines every fragment it transitively
spreads, so the operation file now imports the `*Doc` of fragments reached only through another
fragment. Previously these were missing, producing `Cannot find name 'XFragmentDoc'`. Fragment files
correspondingly no longer emit fragment `*Doc` imports they don't use.

Requires `@graphql-codegen/visitor-plugin-common` `^7.2.2` — earlier v7 releases emit an invalid
`import * from '...'` statement for fragment files whose imports are all elided.
