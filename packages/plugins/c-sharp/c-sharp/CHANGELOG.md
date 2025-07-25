# @graphql-codegen/c-sharp

## 5.1.2

### Patch Changes

- [#1160](https://github.com/dotansimha/graphql-code-generator-community/pull/1160)
  [`dcbb0ef`](https://github.com/dotansimha/graphql-code-generator-community/commit/dcbb0ef50a25d784fbb405816e93dc060de1c5ed)
  Thanks [@ocdi](https://github.com/ocdi)! - Support output of System.Text.Json attributes

- Updated dependencies
  [[`d6c8b90`](https://github.com/dotansimha/graphql-code-generator-community/commit/d6c8b90335ce30c792c61fcf9106adecf83f8a01),
  [`dcbb0ef`](https://github.com/dotansimha/graphql-code-generator-community/commit/dcbb0ef50a25d784fbb405816e93dc060de1c5ed)]:
  - @graphql-codegen/c-sharp-common@1.2.0

## 5.1.1

### Patch Changes

- [#612](https://github.com/dotansimha/graphql-code-generator-community/pull/612)
  [`5af565e`](https://github.com/dotansimha/graphql-code-generator-community/commit/5af565e6dada98e2341968ea37f343c5c348414a)
  Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:
  - Updated dependency [`tslib@^2.8.1` ↗︎](https://www.npmjs.com/package/tslib/v/2.8.1) (from
    `~2.8.0`, in `dependencies`)

- [#828](https://github.com/dotansimha/graphql-code-generator-community/pull/828)
  [`0c551ba`](https://github.com/dotansimha/graphql-code-generator-community/commit/0c551baf81b9d146a644a88e78bfc714894a9ab2)
  Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:
  - Updated dependency [`tslib@~2.8.0` ↗︎](https://www.npmjs.com/package/tslib/v/2.8.0) (from
    `~2.6.0`, in `dependencies`)
- Updated dependencies
  [[`5af565e`](https://github.com/dotansimha/graphql-code-generator-community/commit/5af565e6dada98e2341968ea37f343c5c348414a),
  [`0c551ba`](https://github.com/dotansimha/graphql-code-generator-community/commit/0c551baf81b9d146a644a88e78bfc714894a9ab2)]:
  - @graphql-codegen/c-sharp-common@1.1.1

## 5.1.0

### Minor Changes

- [#816](https://github.com/dotansimha/graphql-code-generator-community/pull/816)
  [`b1ec118`](https://github.com/dotansimha/graphql-code-generator-community/commit/b1ec1187507089362301b874546bf08dd4c8aec3)
  Thanks [@mariusmuntean](https://github.com/mariusmuntean)! - Added support for the new
  configuration option `memberNameConvention` to the c-sharp-operations plugin. Now both C# plugins
  can generate C# code with standard member casing. The default is still camel case, to avoid
  generating code that breaks user's existing code base.

- [#806](https://github.com/dotansimha/graphql-code-generator-community/pull/806)
  [`d1d6d6e`](https://github.com/dotansimha/graphql-code-generator-community/commit/d1d6d6e2cc06b547ff132514ab3e697517438179)
  Thanks [@mariusmuntean](https://github.com/mariusmuntean)! - Added `memberNameConvention` which
  allows you to customize the naming convention for interface/class/record members.

### Patch Changes

- [#820](https://github.com/dotansimha/graphql-code-generator-community/pull/820)
  [`581e733`](https://github.com/dotansimha/graphql-code-generator-community/commit/581e733d6ede02261f89c332c1e3fd4621d34ddc)
  Thanks [@mariusmuntean](https://github.com/mariusmuntean)! - upgrade dependencies and fix type
  errors

- Updated dependencies
  [[`581e733`](https://github.com/dotansimha/graphql-code-generator-community/commit/581e733d6ede02261f89c332c1e3fd4621d34ddc),
  [`b1ec118`](https://github.com/dotansimha/graphql-code-generator-community/commit/b1ec1187507089362301b874546bf08dd4c8aec3)]:
  - @graphql-codegen/c-sharp-common@1.1.0

## 5.0.0

### Major Changes

- [#411](https://github.com/dotansimha/graphql-code-generator-community/pull/411)
  [`218778010`](https://github.com/dotansimha/graphql-code-generator-community/commit/2187780109269543d9024a9ee929dca215c5f406)
  Thanks [@saihaj](https://github.com/saihaj)! - Drop support for Node.js 12 and 14. Require Node.js
  `>= 16`

### Patch Changes

- [#422](https://github.com/dotansimha/graphql-code-generator-community/pull/422)
  [`ef0adf8c2`](https://github.com/dotansimha/graphql-code-generator-community/commit/ef0adf8c2124e4b40d23c52966486a887f122b9b)
  Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:
  - Updated dependency [`tslib@~2.6.0` ↗︎](https://www.npmjs.com/package/tslib/v/2.6.0) (from
    `~2.4.0`, in `dependencies`)
- Updated dependencies
  [[`ef0adf8c2`](https://github.com/dotansimha/graphql-code-generator-community/commit/ef0adf8c2124e4b40d23c52966486a887f122b9b),
  [`218778010`](https://github.com/dotansimha/graphql-code-generator-community/commit/2187780109269543d9024a9ee929dca215c5f406)]:
  - @graphql-codegen/c-sharp-common@1.0.0

## 4.3.1

### Patch Changes

- [#8189](https://github.com/dotansimha/graphql-code-generator/pull/8189)
  [`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f)
  Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix CommonJS TypeScript resolution with
  `moduleResolution` `node16` or `nodenext`

- Updated dependencies
  [[`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f),
  [`47d0a57e2`](https://github.com/dotansimha/graphql-code-generator/commit/47d0a57e27dd0d2334670bfc6c81c45e00ff4e74)]:
  - @graphql-codegen/c-sharp-common@0.1.1
  - @graphql-codegen/visitor-plugin-common@2.12.1
  - @graphql-codegen/plugin-helpers@2.6.2

## 4.3.0

### Minor Changes

- d84afec09: Support TypeScript ESM modules (`"module": "node16"` and
  `"moduleResolution": "node16"`).

  [More information on the TypeScript Release Notes.](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)

### Patch Changes

- Updated dependencies [68bb30e19]
- Updated dependencies [d84afec09]
- Updated dependencies [a4fe5006b]
- Updated dependencies [8e44df58b]
  - @graphql-codegen/visitor-plugin-common@2.11.0
  - @graphql-codegen/c-sharp-common@0.1.0
  - @graphql-codegen/plugin-helpers@2.5.0

## 4.2.15

### Patch Changes

- Updated dependencies [aa1e6eafd]
- Updated dependencies [a42fcbfe4]
- Updated dependencies [8b10f22be]
  - @graphql-codegen/visitor-plugin-common@2.10.0

## 4.2.14

### Patch Changes

- Updated dependencies [d16bebacb]
  - @graphql-codegen/visitor-plugin-common@2.9.1

## 4.2.13

### Patch Changes

- Updated dependencies [c3d7b7226]
  - @graphql-codegen/visitor-plugin-common@2.9.0

## 4.2.12

### Patch Changes

- Updated dependencies [f1fb77bd4]
  - @graphql-codegen/visitor-plugin-common@2.8.0

## 4.2.11

### Patch Changes

- Updated dependencies [9a5f31cb6]
  - @graphql-codegen/visitor-plugin-common@2.7.6

## 4.2.10

### Patch Changes

- Updated dependencies [2966686e9]
  - @graphql-codegen/visitor-plugin-common@2.7.5

## 4.2.9

### Patch Changes

- 35364ed87: Fix namespace of JsonPropertyName

## 4.2.8

### Patch Changes

- Updated dependencies [337fd4f77]
  - @graphql-codegen/visitor-plugin-common@2.7.4

## 4.2.7

### Patch Changes

- Updated dependencies [54718c039]
  - @graphql-codegen/visitor-plugin-common@2.7.3

## 4.2.6

### Patch Changes

- Updated dependencies [11d05e361]
  - @graphql-codegen/visitor-plugin-common@2.7.2

## 4.2.5

### Patch Changes

- Updated dependencies [fd55e2039]
  - @graphql-codegen/visitor-plugin-common@2.7.1

## 4.2.4

### Patch Changes

- Updated dependencies [1479233df]
  - @graphql-codegen/visitor-plugin-common@2.7.0

## 4.2.3

### Patch Changes

- Updated dependencies [c8ef37ae0]
- Updated dependencies [754a33715]
- Updated dependencies [bef4376d5]
- Updated dependencies [be7cb3a82]
  - @graphql-codegen/visitor-plugin-common@2.6.0
  - @graphql-codegen/plugin-helpers@2.4.0

## 4.2.2

### Patch Changes

- 6002feb3d: Fix exports in package.json files for react-native projects
- Updated dependencies [6002feb3d]
  - @graphql-codegen/visitor-plugin-common@2.5.2
  - @graphql-codegen/plugin-helpers@2.3.2

## 4.2.1

### Patch Changes

- Updated dependencies [a9f1f1594]
- Updated dependencies [9ea6621ec]
  - @graphql-codegen/visitor-plugin-common@2.5.1

## 4.2.0

### Minor Changes

- 97ddb487a: feat: GraphQL v16 compatibility

### Patch Changes

- Updated dependencies [97ddb487a]
  - @graphql-codegen/visitor-plugin-common@2.5.0
  - @graphql-codegen/plugin-helpers@2.3.0

## 4.1.6

### Patch Changes

- Updated dependencies [ad02cb9b8]
  - @graphql-codegen/visitor-plugin-common@2.4.0

## 4.1.5

### Patch Changes

- Updated dependencies [b9e85adae]
- Updated dependencies [7c60e5acc]
- Updated dependencies [3c2c847be]
  - @graphql-codegen/visitor-plugin-common@2.3.0
  - @graphql-codegen/plugin-helpers@2.2.0

## 4.1.4

### Patch Changes

- Updated dependencies [0b090e31a]
  - @graphql-codegen/visitor-plugin-common@2.2.1

## 4.1.3

### Patch Changes

- Updated dependencies [d6c2d4c09]
- Updated dependencies [feeae1c66]
- Updated dependencies [5086791ac]
  - @graphql-codegen/visitor-plugin-common@2.2.0

## 4.1.2

### Patch Changes

- Updated dependencies [6470e6cc9]
- Updated dependencies [263570e50]
- Updated dependencies [35199dedf]
  - @graphql-codegen/visitor-plugin-common@2.1.2
  - @graphql-codegen/plugin-helpers@2.1.1

## 4.1.1

### Patch Changes

- Updated dependencies [aabeff181]
  - @graphql-codegen/visitor-plugin-common@2.1.1

## 4.1.0

### Minor Changes

- 39773f59b: enhance(plugins): use getDocumentNodeFromSchema and other utilities from
  @graphql-tools/utils
- 440172cfe: support ESM

### Patch Changes

- Updated dependencies [290170262]
- Updated dependencies [24185985a]
- Updated dependencies [39773f59b]
- Updated dependencies [440172cfe]
  - @graphql-codegen/visitor-plugin-common@2.1.0
  - @graphql-codegen/plugin-helpers@2.1.0

## 4.0.0

### Major Changes

- b0cb13df4: Update to latest `graphql-tools` and `graphql-config` version.

  ‼️ ‼️ ‼️ Please note ‼️ ‼️ ‼️:

  This is a breaking change since Node 10 is no longer supported in `graphql-tools`, and also no
  longer supported for Codegen packages.

### Minor Changes

- b64475b1b: Add options for JSON attributes configuration

### Patch Changes

- Updated dependencies [d80efdec4]
- Updated dependencies [d80efdec4]
- Updated dependencies [b0cb13df4]
  - @graphql-codegen/visitor-plugin-common@2.0.0
  - @graphql-codegen/plugin-helpers@2.0.0

## 3.0.2

### Patch Changes

- Updated dependencies [df19a4ed]
- Updated dependencies [470336a1]
- Updated dependencies [9005cc17]
  - @graphql-codegen/visitor-plugin-common@1.22.0
  - @graphql-codegen/plugin-helpers@1.18.8

## 3.0.1

### Patch Changes

- Updated dependencies [6762aff5]
  - @graphql-codegen/visitor-plugin-common@1.21.3

## 3.0.0

### Major Changes

- 562e6a85: Consider DateTime as builtin C# value type

### Patch Changes

- Updated dependencies [6aaecf1c]
  - @graphql-codegen/visitor-plugin-common@1.21.2

## 2.0.2

### Patch Changes

- 49a2c3b0: Replace float with double
- Updated dependencies [cf1e5abc]
  - @graphql-codegen/visitor-plugin-common@1.21.1

## 2.0.1

### Patch Changes

- Updated dependencies [dfd25caf]
- Updated dependencies [8da7dff6]
  - @graphql-codegen/visitor-plugin-common@1.21.0
  - @graphql-codegen/plugin-helpers@1.18.7

## 2.0.0

### Major Changes

- 0d3b202a: According to feedback, it is needed to remove the access modifiers for interface
  properties.

### Patch Changes

- Updated dependencies [637338cb]
  - @graphql-codegen/plugin-helpers@1.18.6

## 1.19.0

### Minor Changes

- 097bea2f: Added new configuration settings for scalars: `strictScalars` and `defaultScalarType`

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- Updated dependencies [d9212aa0]
- Updated dependencies [f0b5ea53]
- Updated dependencies [097bea2f]
  - @graphql-codegen/visitor-plugin-common@1.20.0
  - @graphql-codegen/plugin-helpers@1.18.5

## 1.18.2

### Patch Changes

- 23862e7e: fix(naming-convention): revert and pin change-case-all dependency for workaround #3256
- Updated dependencies [23862e7e]
  - @graphql-codegen/visitor-plugin-common@1.19.1
  - @graphql-codegen/plugin-helpers@1.18.4

## 1.18.1

### Patch Changes

- 29b75b1e: enhance(namingConvention): use change-case-all instead of individual packages for naming
  convention
- Updated dependencies [e947f8e3]
- Updated dependencies [29b75b1e]
- Updated dependencies [d4942d04]
- Updated dependencies [1f6f3db6]
- Updated dependencies [29b75b1e]
  - @graphql-codegen/visitor-plugin-common@1.19.0
  - @graphql-codegen/plugin-helpers@1.18.3

## 1.18.0

### Minor Changes

- 9e0f6395: This release adds support to optionally emit c# 9 records instead of classes.

  To enable this, add `emitRecords: true` to your codegen yaml or json configuration file. Example:

  ```yaml
  schema: './types.graphql'
  generates:
    ./src/types.cs:
      plugins:
        - c-sharp
  config:
    namespaceName: My.Types
    emitRecords: true
    scalars:
      DateTime: DateTime
  ```

### Patch Changes

- Updated dependencies [5749cb8a]
- Updated dependencies [5a12fe58]
  - @graphql-codegen/visitor-plugin-common@1.18.3

## 1.17.10

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.17.9

### Patch Changes

- f92c5245: Remove unused c-sharp code
- Updated dependencies [07f9b1b2]
- Updated dependencies [35f67120]
  - @graphql-codegen/visitor-plugin-common@1.17.14

## 1.17.8

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL
  comments
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/visitor-plugin-common@1.17.13
  - @graphql-codegen/plugin-helpers@1.17.8
