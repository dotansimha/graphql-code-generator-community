---
'@graphql-codegen/c-sharp-operations': minor
'@graphql-codegen/c-sharp-common': minor
'@graphql-codegen/c-sharp': minor
---

Added support for the new configuration option `memberNameConvention` to the c-sharp-operations
plugin. Now both C# plugins can generate C# code with standard member casing. The default is still
camel case, to avoid generating code that breaks user's existing code base.
