---
"@graphql-codegen/near-operation-file-preset": patch
---

Fix fragment `*Doc` imports for transitively-nested fragments in `documentMode: graphQLTag`. Since visitor-plugin-common v7 a graphQLTag operation inlines every fragment it transitively spreads, so the operation file now imports the `*Doc` of fragments reached only through another fragment (previously missing — `Cannot find name 'XFragmentDoc'`), while fragment files no longer emit unused fragment `*Doc` imports.
