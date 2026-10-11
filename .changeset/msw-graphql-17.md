---
'@graphql-codegen/typescript-msw': patch
---

Support graphql 17 and msw 3: an operation without variables no longer throws (graphql 17 omits an empty `variableDefinitions`), and the peer ranges accept `graphql ^17` and `msw ^3`.
