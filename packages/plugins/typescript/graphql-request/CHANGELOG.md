# @graphql-codegen/typescript-graphql-request

## 6.2.0

### Minor Changes

- [#549](https://github.com/dotansimha/graphql-code-generator-community/pull/549)
  [`ad8258c`](https://github.com/dotansimha/graphql-code-generator-community/commit/ad8258c66edd732a1b5ef2536021f06e44219daa)
  Thanks [@pentla](https://github.com/pentla)! - Fix TypeScript error when moduleResolution is
  "nodenext" or "bundler"

### Patch Changes

- [#559](https://github.com/dotansimha/graphql-code-generator-community/pull/559)
  [`64c2c10`](https://github.com/dotansimha/graphql-code-generator-community/commit/64c2c10e82b1efe6a8ea7a3c4d9ed5b340945503)
  Thanks [@mtlewis](https://github.com/mtlewis)! - Fix unused parameter in generated code which
  caused TS errors for users of the package.

## 6.1.0

### Minor Changes

- [#512](https://github.com/dotansimha/graphql-code-generator-community/pull/512)
  [`34cdb37`](https://github.com/dotansimha/graphql-code-generator-community/commit/34cdb37247fdf8002176b0e63e8c5bce32f02f24)
  Thanks [@axe-me](https://github.com/axe-me)! - pass variables to wrapper function

### Patch Changes

- [#517](https://github.com/dotansimha/graphql-code-generator-community/pull/517)
  [`bcd2324`](https://github.com/dotansimha/graphql-code-generator-community/commit/bcd232493d205d21b57e98b8ce83e74b081ad13f)
  Thanks [@benjie](https://github.com/benjie)! - Add `.mts` and `.cts` as allowable extensions to
  graphql-request

## 6.0.1

### Patch Changes

- [#462](https://github.com/dotansimha/graphql-code-generator-community/pull/462)
  [`f7170557e`](https://github.com/dotansimha/graphql-code-generator-community/commit/f7170557ed325af4224447ec041fc10f04ccc5b1)
  Thanks [@yshrsmz](https://github.com/yshrsmz)! - fix(graphql-request): add import for GraphQLError

## 6.0.0

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

- [#408](https://github.com/dotansimha/graphql-code-generator-community/pull/408)
  [`5d5efe212`](https://github.com/dotansimha/graphql-code-generator-community/commit/5d5efe2123b4c6da0a5eebc83407a784bdbd59b4)
  Thanks [@dseeto](https://github.com/dseeto)! - return errors in return type for rawRequest

- [#411](https://github.com/dotansimha/graphql-code-generator-community/pull/411)
  [`218778010`](https://github.com/dotansimha/graphql-code-generator-community/commit/2187780109269543d9024a9ee929dca215c5f406)
  Thanks [@saihaj](https://github.com/saihaj)! - fix(graphql-request): use Headers in return type
  when rawRequest is true

## 5.0.0

### Major Changes

- [#335](https://github.com/dotansimha/graphql-code-generator-community/pull/335)
  [`b46fff0d6`](https://github.com/dotansimha/graphql-code-generator-community/commit/b46fff0d6d7f5a09e3a263715200d4044c590d63)
  Thanks [@michaelgmcd](https://github.com/michaelgmcd)! - feature: support graphql-request 6+

## 4.5.9

### Patch Changes

- [#311](https://github.com/dotansimha/graphql-code-generator-community/pull/311)
  [`2c1652ec0`](https://github.com/dotansimha/graphql-code-generator-community/commit/2c1652ec067248d91fd5674cdd4c07ab8ffb0b97)
  Thanks [@domdomegg](https://github.com/domdomegg)! - Limit graphql-request version in plugin to <=
  5.1 to reflect breaking changes in graphql-request package.

## 4.5.8

### Patch Changes

- Updated dependencies
  [[`63dc8f205`](https://github.com/dotansimha/graphql-code-generator/commit/63dc8f2054e27b944f7d8dc59db8afa85760a127)]:
  - @graphql-codegen/visitor-plugin-common@2.13.1
  - @graphql-codegen/plugin-helpers@2.7.2

## 4.5.7

### Patch Changes

- Updated dependencies
  [[`a46b8d99c`](https://github.com/dotansimha/graphql-code-generator/commit/a46b8d99c797283d773ec14163c62be9c84d4c2b)]:
  - @graphql-codegen/visitor-plugin-common@2.13.0

## 4.5.6

### Patch Changes

- Updated dependencies
  [[`1bd7f771c`](https://github.com/dotansimha/graphql-code-generator/commit/1bd7f771ccb949a5a37395c7c57cb41c19340714)]:
  - @graphql-codegen/visitor-plugin-common@2.12.2

## 4.5.5

### Patch Changes

- [#8334](https://github.com/dotansimha/graphql-code-generator/pull/8334)
  [`e6e497afa`](https://github.com/dotansimha/graphql-code-generator/commit/e6e497afa54213ad3eabfae26c014ab03eb4727c)
  Thanks [@jcarrus](https://github.com/jcarrus)! - graphql-request: append explicit extension when
  importing dom types

- Updated dependencies
  [[`4113b1bd3`](https://github.com/dotansimha/graphql-code-generator/commit/4113b1bd39f3d32759c68a292e8492a0dd4f7371)]:
  - @graphql-codegen/plugin-helpers@2.7.1

## 4.5.4

### Patch Changes

- [#8295](https://github.com/dotansimha/graphql-code-generator/pull/8295)
  [`a18818118`](https://github.com/dotansimha/graphql-code-generator/commit/a18818118c11d834ae41edbd172dbc259817fcb6)
  Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:

  - Updated dependency
    [`graphql-request@^3.4.0 || ^4.0.0 || ^5.0.0` ↗︎](https://www.npmjs.com/package/graphql-request/v/null)
    (from `^3.4.0 || ^4.0.0`, in `peerDependencies`)

- Updated dependencies
  [[`2ed21a471`](https://github.com/dotansimha/graphql-code-generator/commit/2ed21a471f8de58ecafebf4bf64b3c32cee24d2f)]:
  - @graphql-codegen/plugin-helpers@2.7.0

## 4.5.3

### Patch Changes

- [#8189](https://github.com/dotansimha/graphql-code-generator/pull/8189)
  [`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f)
  Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix CommonJS TypeScript resolution with
  `moduleResolution` `node16` or `nodenext`

- Updated dependencies
  [[`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f),
  [`47d0a57e2`](https://github.com/dotansimha/graphql-code-generator/commit/47d0a57e27dd0d2334670bfc6c81c45e00ff4e74)]:
  - @graphql-codegen/visitor-plugin-common@2.12.1
  - @graphql-codegen/plugin-helpers@2.6.2

## 4.5.2

### Patch Changes

- Updated dependencies [2cbcbb371]
  - @graphql-codegen/visitor-plugin-common@2.12.0
  - @graphql-codegen/plugin-helpers@2.6.0

## 4.5.1

### Patch Changes

- Updated dependencies [525ad580b]
  - @graphql-codegen/visitor-plugin-common@2.11.1

## 4.5.0

### Minor Changes

- d84afec09: Support TypeScript ESM modules (`"module": "node16"` and
  `"moduleResolution": "node16"`).

  [More information on the TypeScript Release Notes.](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)

### Patch Changes

- 28f834614: Honor importOperationTypesFrom config option
- Updated dependencies [68bb30e19]
- Updated dependencies [d84afec09]
- Updated dependencies [a4fe5006b]
- Updated dependencies [8e44df58b]
  - @graphql-codegen/visitor-plugin-common@2.11.0
  - @graphql-codegen/plugin-helpers@2.5.0

## 4.4.11

### Patch Changes

- Updated dependencies [aa1e6eafd]
- Updated dependencies [a42fcbfe4]
- Updated dependencies [8b10f22be]
  - @graphql-codegen/visitor-plugin-common@2.10.0

## 4.4.10

### Patch Changes

- Updated dependencies [d16bebacb]
  - @graphql-codegen/visitor-plugin-common@2.9.1

## 4.4.9

### Patch Changes

- Updated dependencies [c3d7b7226]
  - @graphql-codegen/visitor-plugin-common@2.9.0

## 4.4.8

### Patch Changes

- Updated dependencies [f1fb77bd4]
  - @graphql-codegen/visitor-plugin-common@2.8.0

## 4.4.7

### Patch Changes

- Updated dependencies [9a5f31cb6]
  - @graphql-codegen/visitor-plugin-common@2.7.6

## 4.4.6

### Patch Changes

- Updated dependencies [2966686e9]
  - @graphql-codegen/visitor-plugin-common@2.7.5

## 4.4.5

### Patch Changes

- 7fae9fbf4: fix(plugins/gql-request): remove unused `GraphQLError` import

## 4.4.4

### Patch Changes

- 44cd9a85e: Fix rawRequest return type

  The errors property from the return type has been removed, because it is never returned by
  `graphql-request`. Instead, failed requests throw a `ClientError`. Also, data is no longer
  optional, because it always exists for successful responses.

## 4.4.3

### Patch Changes

- Updated dependencies [337fd4f77]
  - @graphql-codegen/visitor-plugin-common@2.7.4

## 4.4.2

### Patch Changes

- Updated dependencies [54718c039]
  - @graphql-codegen/visitor-plugin-common@2.7.3

## 4.4.1

### Patch Changes

- Updated dependencies [11d05e361]
  - @graphql-codegen/visitor-plugin-common@2.7.2

## 4.4.0

### Minor Changes

- 17ad88541: Exposes `operationType` to graphql-request sdk middlewares.

## 4.3.7

### Patch Changes

- Updated dependencies [fd55e2039]
  - @graphql-codegen/visitor-plugin-common@2.7.1

## 4.3.6

### Patch Changes

- Updated dependencies [1479233df]
  - @graphql-codegen/visitor-plugin-common@2.7.0

## 4.3.5

### Patch Changes

- 275d40ae5: Allow `graphql-request@4` in `peerDependencies` range

## 4.3.4

### Patch Changes

- Updated dependencies [c8ef37ae0]
- Updated dependencies [754a33715]
- Updated dependencies [bef4376d5]
- Updated dependencies [be7cb3a82]
  - @graphql-codegen/visitor-plugin-common@2.6.0
  - @graphql-codegen/plugin-helpers@2.4.0

## 4.3.3

### Patch Changes

- 6002feb3d: Fix exports in package.json files for react-native projects
- Updated dependencies [6002feb3d]
  - @graphql-codegen/visitor-plugin-common@2.5.2
  - @graphql-codegen/plugin-helpers@2.3.2

## 4.3.2

### Patch Changes

- 22f6e4a92: Don't import `print` as type when supporting `useTypeImports` & `rawRequest` and
  `documentMode` is not a `string`.

## 4.3.1

### Patch Changes

- Updated dependencies [a9f1f1594]
- Updated dependencies [9ea6621ec]
  - @graphql-codegen/visitor-plugin-common@2.5.1

## 4.3.0

### Minor Changes

- 3b87f049a: Add the extensionsType config in order to change the default type for extensions when
  rawRequest is true.

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

- 440172cfe: support ESM

### Patch Changes

- 24185985a: bump graphql-tools package versions
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

### Patch Changes

- Updated dependencies [d80efdec4]
- Updated dependencies [d80efdec4]
- Updated dependencies [b0cb13df4]
  - @graphql-codegen/visitor-plugin-common@2.0.0
  - @graphql-codegen/plugin-helpers@2.0.0

## 3.2.5

### Patch Changes

- Updated dependencies [df19a4ed]
- Updated dependencies [470336a1]
- Updated dependencies [9005cc17]
  - @graphql-codegen/visitor-plugin-common@1.22.0
  - @graphql-codegen/plugin-helpers@1.18.8

## 3.2.4

### Patch Changes

- Updated dependencies [6762aff5]
  - @graphql-codegen/visitor-plugin-common@1.21.3

## 3.2.3

### Patch Changes

- Updated dependencies [6aaecf1c]
  - @graphql-codegen/visitor-plugin-common@1.21.2

## 3.2.2

### Patch Changes

- Updated dependencies [cf1e5abc]
  - @graphql-codegen/visitor-plugin-common@1.21.1

## 3.2.1

### Patch Changes

- dfd25caf: chore(deps): bump graphql-tools versions
- Updated dependencies [dfd25caf]
- Updated dependencies [8da7dff6]
  - @graphql-codegen/visitor-plugin-common@1.21.0
  - @graphql-codegen/plugin-helpers@1.18.7

## 3.2.0

### Minor Changes

- 9b59605d: feat(typescript-graphql-request): Add enhancements to request middleware function
  (#5883, #5807) #5884

### Patch Changes

- Updated dependencies [637338cb]
  - @graphql-codegen/plugin-helpers@1.18.6

## 3.1.1

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- 74e5afa4: fix(graphql-request): print document for rawRequest if documentMode is not string
- Updated dependencies [d9212aa0]
- Updated dependencies [f0b5ea53]
- Updated dependencies [097bea2f]
  - @graphql-codegen/visitor-plugin-common@1.20.0
  - @graphql-codegen/plugin-helpers@1.18.5

## 3.1.0

### Minor Changes

- af6fb509: Removed the unnecessary call to the print function, since graphql-request would call
  this function internally if needed.

### Patch Changes

- Updated dependencies [e947f8e3]
- Updated dependencies [29b75b1e]
- Updated dependencies [d4942d04]
- Updated dependencies [1f6f3db6]
- Updated dependencies [29b75b1e]
  - @graphql-codegen/visitor-plugin-common@1.19.0
  - @graphql-codegen/plugin-helpers@1.18.3

## 3.0.2

### Patch Changes

- 387d136f: fix(typescript-graphql-request): declare a peer dependency on graphql-request
- ed8cab50: fix(plugin: graphql-requests): Fix type errors in auto-generated methods
- Updated dependencies [5749cb8a]
- Updated dependencies [5a12fe58]
  - @graphql-codegen/visitor-plugin-common@1.18.3

## 3.0.1

### Patch Changes

- 85ba9f49: Fix for error thrown on anonymous operations
- 4b1ca624: fix(plugin: graphql-requests): Fix argument types in auto-generated methods
- f2e3548a: Added missing import for HeadersInit
- Updated dependencies [63be0f40]
- Updated dependencies [190482a1]
- Updated dependencies [4444348d]
- Updated dependencies [142b32b3]
- Updated dependencies [42213fa0]
  - @graphql-codegen/visitor-plugin-common@1.18.1

## 3.0.0

### Major Changes

- d41904e8: Support passing custom headers per each request method.

  NOTE: This version of this plugin requires you to update to graphql-request > 3.4.0

### Patch Changes

- Updated dependencies [64293437]
- Updated dependencies [fd5843a7]
- Updated dependencies [d75051f5]
  - @graphql-codegen/visitor-plugin-common@1.17.22

## 2.0.3

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/plugin-helpers@1.18.2

## 2.0.2

### Patch Changes

- 73442b73: fix grapqhl-request import types
- Updated dependencies [92d8f876]
  - @graphql-codegen/visitor-plugin-common@1.17.16

## 2.0.1

### Patch Changes

- fd96ef29: better integration with importDocumentNodeExternallyFrom
- d4847bfa: Fixes issues with latest graphql-request and rawRequest: true
- Updated dependencies [d2cde3d5]
- Updated dependencies [89a6aa80]
- Updated dependencies [f603b8f8]
- Updated dependencies [da8bdd17]
  - @graphql-codegen/visitor-plugin-common@1.17.15
  - @graphql-codegen/plugin-helpers@1.17.9

## 2.0.0

### Major Changes

- af3803b8: Upgrade generated code to match graphql-request v3.

  - `@graphql-codegen/typescript-graphql-request` @ `v1` => matches `graphql-request` (v1 and v2)
  - `@graphql-codegen/typescript-graphql-request` @ `v2` => matches `graphql-request` (v3)

  ## Breaking Changes

  `v3` of `graphql-request` has changed the path of some files. That means that generated code needs
  to adjusted.

  The actual change is described here: https://github.com/prisma-labs/graphql-request/issues/186

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL
  comments
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/visitor-plugin-common@1.17.13
  - @graphql-codegen/plugin-helpers@1.17.8
