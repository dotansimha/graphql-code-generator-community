---
'@graphql-codegen/typescript-react-query': minor
---

Allow fetcher config to accept both `string` and `object`. `object` let's user specify the import path to their `GraphQLClient` instance. So it will make it easier to generated hooks by not
passing down GraphQLClient.
