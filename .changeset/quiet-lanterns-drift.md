---
'@graphql-codegen/near-operation-file-preset': major
---

Update `@graphql-codegen/add`, `@graphql-codegen/plugin-helpers` and `@graphql-codegen/visitor-plugin-common` to v8.

The preset no longer reads `emitLegacyCommonJSImports`, which v8 removed. Generated relative imports use `importExtension` only, and get no extension when it is not set. If you relied on `emitLegacyCommonJSImports: false` to append `.js`, set `importExtension: '.js'` instead.

The `graphql` peer dependency range is now `^16.0.0 || ^17.0.0`, and `engines.node` is now `>=22.18.0`.
