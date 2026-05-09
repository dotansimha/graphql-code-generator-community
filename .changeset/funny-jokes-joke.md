---
'@graphql-codegen/near-operation-file-preset': patch
---

Deduplicate `externalFragments` by name when multiple source documents are merged into the same generated output

Why: multiple documents can resolve to the same generated file and each contribute the same external fragment
downstream plugins then receive repeated externalFragments, which can cause severe perf blow-ups

Relates to: https://github.com/dotansimha/graphql-code-generator-community/issues/752
