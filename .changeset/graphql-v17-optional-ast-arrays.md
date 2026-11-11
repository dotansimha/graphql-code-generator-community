---
'@graphql-codegen/c-sharp': patch
'@graphql-codegen/java-apollo-android': patch
'@graphql-codegen/typescript-oclif': patch
'@graphql-codegen/typescript-react-apollo': patch
'@graphql-codegen/typescript-urql': patch
---

Support GraphQL v17, where AST nodes leave `variableDefinitions`, `directives` and `arguments`
undefined instead of an empty array.
