---
'@graphql-codegen/near-operation-file-preset': patch
---

Fix nested fragment type imports being omitted when an outer fragment spread includes conditional directives (`@include`/`@skip`) or incremental delivery (`@defer`).
