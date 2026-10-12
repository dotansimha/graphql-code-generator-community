---
'@graphql-codegen/typescript-msw': patch
---

Support graphql 17: an operation without variables no longer throws (graphql 17 omits an empty `variableDefinitions`), and the graphql peer range accepts `^17`.
