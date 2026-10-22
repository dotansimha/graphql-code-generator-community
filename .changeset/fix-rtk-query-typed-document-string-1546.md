---
"@graphql-codegen/typescript-rtk-query": patch
---

Call `.toString()` on document variable instead of `as unknown as string` so `TypedDocumentString` yields an actual primitive string at runtime.
