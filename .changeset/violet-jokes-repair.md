---
'@graphql-codegen/typescript-react-query': minor
---

Reverts problematic part of PR #8497. That PR fixed an issue with infinite query generated hooks not utilizing pageParamKeys for custom fetchers but in the process introduced a type error. This removes the cause of the type error.
