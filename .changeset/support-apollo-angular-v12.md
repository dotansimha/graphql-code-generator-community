---
"@graphql-codegen/typescript-apollo-angular": patch
---

Support apollo-angular v12+ combined parameter syntax

For `apolloAngularVersion >= 12`, the generated SDK methods now internally combine variables into the options object when calling apollo-angular methods, matching the v12+ API requirements. The external SDK method signatures remain unchanged for backward compatibility.
