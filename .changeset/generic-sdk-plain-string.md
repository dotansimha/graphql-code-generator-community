---
'@graphql-codegen/typescript-generic-sdk': patch
---

`documentMode: 'string'` is now remapped to `'plainString'` with a console warning, because the `'string'` output referenced an undeclared `TypedDocumentString`. Documents are now plain strings and `Requester` types `doc` as `string`. If you supplied `TypedDocumentString` yourself (e.g. via the `add` plugin) or relied on the `TypedDocumentString<Result, Variables>` type of exported documents, please check your setup. Set `documentMode: 'plainString'` to silence the warning.
