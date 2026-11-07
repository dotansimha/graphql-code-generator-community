---
'@graphql-codegen/c-sharp-operations': major
---

Update `@graphql-codegen/plugin-helpers` and `@graphql-codegen/visitor-plugin-common` to v8. `validate` now reads `outputFile` from the `info` object passed as its fourth argument, so it requires `@graphql-codegen/cli` v8. With `documentMode: plainString`, generated documents now inline referenced fragment definitions instead of emitting `${FragmentName}` placeholders.

The `graphql` peer dependency range is now `^16.0.0 || ^17.0.0`, and `engines.node` is now `>=22.18.0`.
