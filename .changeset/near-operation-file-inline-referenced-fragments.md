---
'@graphql-codegen/near-operation-file-preset': minor
---

Support `inlineReferencedFragmentsInFragmentDocuments` in `documentMode: graphQLTag`.

When the option is enabled, fragment documents interpolate the fragments they spread directly, so
the generated file now imports those fragments' `*Doc` as well.

Requires `@graphql-codegen/visitor-plugin-common` `^7.4.0`.
