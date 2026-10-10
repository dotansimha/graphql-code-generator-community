---
'@graphql-codegen/near-operation-file-preset': patch
---

Fix nested fragment imports being dropped when a fragment's type and document share the same name (e.g. with `omitOperationSuffix`), such as when `inlineFragmentTypes` is `combine`.
