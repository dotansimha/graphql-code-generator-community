---
'@graphql-codegen/near-operation-file-preset': patch
---

Fix unused interface fragment type imports when a fragment is spread directly in another fragment.

A polymorphic fragment spread at the top level of another fragment definition (e.g. `...AnimalFragment`
inside `fragment CatFragment on Cat`) imported every possible type of the spread fragment
(`AnimalFragment_Cat`, `AnimalFragment_Dog`, …) instead of only those matching the parent fragment's
type condition, failing compilation under `noUnusedLocals`. Such spreads are now narrowed the same
way as spreads under a field.
