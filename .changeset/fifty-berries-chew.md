---
"@graphql-codegen/typescript-rtk-query": patch
---

fix: update imported api to use alternate name

Previously imported api name did not update actual implementation 

```
import { newApiName } from '../baseApi'

...
const injectedApi = oldApiName...

```

now it does update the implementation

```
import { newApiName } from '../baseApi'

...
const injectedApi = newApiName...
...
