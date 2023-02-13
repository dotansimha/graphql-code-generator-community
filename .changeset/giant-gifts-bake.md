---
"@graphql-codegen/typescript-rtk-query": minor
---

feat(typescript-rtk-query): add addTransformResponse to config

You can now add the optional `addTransformResponse` boolean config to automatically generate `transformResponse` in injectedApi endpoint. e.g.

```
    Feed: build.query<FeedQuery, FeedQueryVariables>({
      query: (variables) => ({ document: FeedDocument, variables })
      transformResponse: (response: FeedQuery) => response <---
    }),
```
