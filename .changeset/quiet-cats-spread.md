---
'@graphql-codegen/near-operation-file-preset': patch
---

Fix unused interface fragment type imports when a fragment is spread directly in another fragment or operation.

Top-level spreads of a polymorphic fragment (e.g. `...AnimalFragment` inside
`fragment CatFragment on Cat`) were not narrowed to the parent's type, producing unused imports or,
when also spread in a nested field, missing ones.
