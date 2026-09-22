---
"@graphql-codegen/c-sharp-common": patch
"@graphql-codegen/c-sharp": patch
"@graphql-codegen/c-sharp-operations": patch
---

Fix nullable suffix generation for DateOnly, TimeSpan, and DateTimeOffset scalar mappings in C# plugins.

Added DateOnly, TimeSpan, and DateTimeOffset to the csharpValueTypes allow list, enabling proper nullable suffix generation for GraphQL scalar fields mapped to these .NET value types. These are built-in .NET value types that should be treated consistently with DateTime for nullable field generation.

Related: #1548
