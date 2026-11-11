---
'@graphql-codegen/typescript-nhost': major
---

Update `@graphql-codegen/plugin-helpers`, `@graphql-codegen/visitor-plugin-common` and `@graphql-codegen/typescript` to v8/v7. The generated output follows `@graphql-codegen/typescript` v7: scalars without a configured type are now `unknown` instead of `any`, and the `Exact`, `MakeOptional`, `MakeMaybe`, `MakeEmpty` and `Incremental` helper types are no longer emitted.

The `graphql` peer dependency range is now `^16.0.0 || ^17.0.0`, and `engines.node` is now `>=22.18.0`.
