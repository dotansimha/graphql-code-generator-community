# @graphql-codegen/near-operation-file-preset

## 3.1.0

### Minor Changes

- [#1113](https://github.com/dotansimha/graphql-code-generator-community/pull/1113)
  [`5e4a3a8`](https://github.com/dotansimha/graphql-code-generator-community/commit/5e4a3a8f90a3f84eaeebfafccd96b04d3161ef3c)
  Thanks [@wassim-k](https://github.com/wassim-k)! - Only import interface types that are used in
  the document.

## 3.0.1

### Patch Changes

- [#355](https://github.com/dotansimha/graphql-code-generator-community/pull/355)
  [`ca72b89`](https://github.com/dotansimha/graphql-code-generator-community/commit/ca72b89a601979799d0c10087535ff2acc4378f0)
  Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:

  - Updated dependency
    [`@graphql-codegen/visitor-plugin-common@2.13.8` ↗︎](https://www.npmjs.com/package/@graphql-codegen/visitor-plugin-common/v/2.13.8)
    (from `2.13.1`, in `dependencies`)

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

## 3.0.0

### Major Changes

- [#414](https://github.com/dotansimha/graphql-code-generator-community/pull/414)
  [`02d487c8c`](https://github.com/dotansimha/graphql-code-generator-community/commit/02d487c8c7a8e55da31b43fcb30d48615bc33950)
  Thanks [@saihaj](https://github.com/saihaj)! - accept skipDocumentsValidation config parameter

  ‼️ ‼️ ‼️ Please note ‼️ ‼️ ‼️:

  This is a breaking change since previous versions skips all documents validation and this could
  raise validation errors while generating types.

- [#411](https://github.com/dotansimha/graphql-code-generator-community/pull/411)
  [`218778010`](https://github.com/dotansimha/graphql-code-generator-community/commit/2187780109269543d9024a9ee929dca215c5f406)
  Thanks [@saihaj](https://github.com/saihaj)! - Drop support for Node.js 12 and 14. Require Node.js
  `>= 16`

### Patch Changes

- [#411](https://github.com/dotansimha/graphql-code-generator-community/pull/411)
  [`218778010`](https://github.com/dotansimha/graphql-code-generator-community/commit/2187780109269543d9024a9ee929dca215c5f406)
  Thanks [@saihaj](https://github.com/saihaj)! - dependencies updates:

  - Updated dependency
    [`@graphql-tools/utils@^10.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/utils/v/10.0.0)
    (from `^8.8.0`, in `dependencies`)

- [#422](https://github.com/dotansimha/graphql-code-generator-community/pull/422)
  [`ef0adf8c2`](https://github.com/dotansimha/graphql-code-generator-community/commit/ef0adf8c2124e4b40d23c52966486a887f122b9b)
  Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:

  - Updated dependency [`tslib@~2.6.0` ↗︎](https://www.npmjs.com/package/tslib/v/2.6.0) (from
    `~2.4.0`, in `dependencies`)

- [#407](https://github.com/dotansimha/graphql-code-generator-community/pull/407)
  [`03655cc7c`](https://github.com/dotansimha/graphql-code-generator-community/commit/03655cc7ce680c042650550fcf75183a0ca8bcd5)
  Thanks [@aboks](https://github.com/aboks)! - Fix duplicate imports with inlineFragmentTypes:
  combine

## 2.5.0

### Minor Changes

- [#24](https://github.com/dotansimha/graphql-code-generator-community/pull/24)
  [`41b0ae176`](https://github.com/dotansimha/graphql-code-generator-community/commit/41b0ae17626533ae7ba4ebba429634ec2df398bb)
  Thanks [@gwesseling](https://github.com/gwesseling)! - Added the fileName option for the
  near-operation-file-preset to force the generated filename

## 2.4.4

### Patch Changes

- [#8525](https://github.com/dotansimha/graphql-code-generator/pull/8525)
  [`63dc8f205`](https://github.com/dotansimha/graphql-code-generator/commit/63dc8f2054e27b944f7d8dc59db8afa85760a127)
  Thanks [@charlypoly](https://github.com/charlypoly)! - remove `DetailledError`, not supported by
  Listr renderer

- Updated dependencies
  [[`63dc8f205`](https://github.com/dotansimha/graphql-code-generator/commit/63dc8f2054e27b944f7d8dc59db8afa85760a127)]:
  - @graphql-codegen/visitor-plugin-common@2.13.1
  - @graphql-codegen/plugin-helpers@2.7.2

## 2.4.3

### Patch Changes

- Updated dependencies
  [[`a46b8d99c`](https://github.com/dotansimha/graphql-code-generator/commit/a46b8d99c797283d773ec14163c62be9c84d4c2b)]:
  - @graphql-codegen/visitor-plugin-common@2.13.0

## 2.4.2

### Patch Changes

- Updated dependencies
  [[`1bd7f771c`](https://github.com/dotansimha/graphql-code-generator/commit/1bd7f771ccb949a5a37395c7c57cb41c19340714)]:
  - @graphql-codegen/visitor-plugin-common@2.12.2

## 2.4.1

### Patch Changes

- [#8189](https://github.com/dotansimha/graphql-code-generator/pull/8189)
  [`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f)
  Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix CommonJS TypeScript resolution with
  `moduleResolution` `node16` or `nodenext`

- Updated dependencies
  [[`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f),
  [`47d0a57e2`](https://github.com/dotansimha/graphql-code-generator/commit/47d0a57e27dd0d2334670bfc6c81c45e00ff4e74)]:
  - @graphql-codegen/add@3.2.1
  - @graphql-codegen/visitor-plugin-common@2.12.1
  - @graphql-codegen/plugin-helpers@2.6.2

## 2.4.0

### Minor Changes

- 2cbcbb371: Add new flag to emit legacy common js imports. Default it will be `true` this way it
  ensure that generated code works with
  [non-compliant bundlers](https://github.com/dotansimha/graphql-code-generator/issues/8065).

  You can use the option in your config:

  ```yaml
  schema: 'schema.graphql'
   documents:
     - 'src/**/*.graphql'
   emitLegacyCommonJSImports: true
  ```

  Alternative you can use the CLI to set this option:

  ```bash
  $ codegen --config-file=config.yml --emit-legacy-common-js-imports
  ```

### Patch Changes

- Updated dependencies [2cbcbb371]
  - @graphql-codegen/visitor-plugin-common@2.12.0
  - @graphql-codegen/plugin-helpers@2.6.0

## 2.3.1

### Patch Changes

- 525ad580b: Revert breaking change for Next.js applications that are incapable of resolving an
  import with a `.js` extension.
- Updated dependencies [525ad580b]
  - @graphql-codegen/visitor-plugin-common@2.11.1

## 2.3.0

### Minor Changes

- 68bb30e19: Attach `.js` extension to relative file imports for compliance with ESM module
  resolution. Since in CommonJS the `.js` extension is optional, this is not a breaking change.

  If you have path configuration within your configuration, consider attaching `.js` if you are
  migrating to ESM.

  ```yml
  mappers:
    MyOtherType: './my-file.js#MyCustomOtherType',
  ```

- d84afec09: Support TypeScript ESM modules (`"module": "node16"` and
  `"moduleResolution": "node16"`).

  [More information on the TypeScript Release Notes.](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)

### Patch Changes

- 1de927e6f: Don't emit imports to the same location, resulting in name clashes.
- Updated dependencies [68bb30e19]
- Updated dependencies [d84afec09]
- Updated dependencies [a4fe5006b]
- Updated dependencies [8e44df58b]
  - @graphql-codegen/visitor-plugin-common@2.11.0
  - @graphql-codegen/add@3.2.0
  - @graphql-codegen/plugin-helpers@2.5.0

## 2.2.15

### Patch Changes

- Updated dependencies [aa1e6eafd]
- Updated dependencies [a42fcbfe4]
- Updated dependencies [8b10f22be]
  - @graphql-codegen/visitor-plugin-common@2.10.0

## 2.2.14

### Patch Changes

- Updated dependencies [d16bebacb]
  - @graphql-codegen/visitor-plugin-common@2.9.1

## 2.2.13

### Patch Changes

- Updated dependencies [c3d7b7226]
  - @graphql-codegen/visitor-plugin-common@2.9.0

## 2.2.12

### Patch Changes

- Updated dependencies [f1fb77bd4]
  - @graphql-codegen/visitor-plugin-common@2.8.0

## 2.2.11

### Patch Changes

- Updated dependencies [9a5f31cb6]
  - @graphql-codegen/visitor-plugin-common@2.7.6

## 2.2.10

### Patch Changes

- Updated dependencies [2966686e9]
  - @graphql-codegen/visitor-plugin-common@2.7.5

## 2.2.9

### Patch Changes

- Updated dependencies [337fd4f77]
  - @graphql-codegen/visitor-plugin-common@2.7.4

## 2.2.8

### Patch Changes

- Updated dependencies [54718c039]
  - @graphql-codegen/visitor-plugin-common@2.7.3

## 2.2.7

### Patch Changes

- 84da6289c: [near-operation-file-preset] Importing root types when a fragment spread a fragment
  without any field
- Updated dependencies [11d05e361]
  - @graphql-codegen/visitor-plugin-common@2.7.2

## 2.2.6

### Patch Changes

- Updated dependencies [fd55e2039]
  - @graphql-codegen/visitor-plugin-common@2.7.1

## 2.2.5

### Patch Changes

- Updated dependencies [1479233df]
  - @graphql-codegen/visitor-plugin-common@2.7.0

## 2.2.4

### Patch Changes

- Updated dependencies [c8ef37ae0]
- Updated dependencies [754a33715]
- Updated dependencies [bef4376d5]
- Updated dependencies [be7cb3a82]
  - @graphql-codegen/visitor-plugin-common@2.6.0
  - @graphql-codegen/plugin-helpers@2.4.0

## 2.2.3

### Patch Changes

- 6002feb3d: Fix exports in package.json files for react-native projects
- Updated dependencies [8643b3bf3]
- Updated dependencies [6002feb3d]
  - @graphql-codegen/add@3.1.1
  - @graphql-codegen/visitor-plugin-common@2.5.2
  - @graphql-codegen/plugin-helpers@2.3.2

## 2.2.2

### Patch Changes

- Updated dependencies [a9f1f1594]
- Updated dependencies [9ea6621ec]
  - @graphql-codegen/visitor-plugin-common@2.5.1

## 2.2.1

### Patch Changes

- 6c898efe5: list all dependencies used by the package in the package.json

## 2.2.0

### Minor Changes

- 97ddb487a: feat: GraphQL v16 compatibility

### Patch Changes

- Updated dependencies [97ddb487a]
  - @graphql-codegen/visitor-plugin-common@2.5.0
  - @graphql-codegen/plugin-helpers@2.3.0

## 2.1.6

### Patch Changes

- Updated dependencies [ad02cb9b8]
  - @graphql-codegen/visitor-plugin-common@2.4.0

## 2.1.5

### Patch Changes

- Updated dependencies [b9e85adae]
- Updated dependencies [7c60e5acc]
- Updated dependencies [3c2c847be]
  - @graphql-codegen/visitor-plugin-common@2.3.0
  - @graphql-codegen/plugin-helpers@2.2.0

## 2.1.4

### Patch Changes

- Updated dependencies [0b090e31a]
  - @graphql-codegen/visitor-plugin-common@2.2.1

## 2.1.3

### Patch Changes

- Updated dependencies [d6c2d4c09]
- Updated dependencies [feeae1c66]
- Updated dependencies [5086791ac]
  - @graphql-codegen/visitor-plugin-common@2.2.0

## 2.1.2

### Patch Changes

- Updated dependencies [6470e6cc9]
- Updated dependencies [263570e50]
- Updated dependencies [35199dedf]
  - @graphql-codegen/visitor-plugin-common@2.1.2
  - @graphql-codegen/plugin-helpers@2.1.1

## 2.1.1

### Patch Changes

- Updated dependencies [aabeff181]
  - @graphql-codegen/visitor-plugin-common@2.1.1

## 2.1.0

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
  - @graphql-codegen/add@3.1.0

## 2.0.0

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
  - @graphql-codegen/add@3.0.0

## 1.18.6

### Patch Changes

- 53d212896: dedupeFragments deep fragment import fix
- 841426e5d: Further fragments import on dedupeFragments edge cases fix

## 1.18.5

### Patch Changes

- 15b18aa3: fix missing imports on dedupeFragments on near-operation-file
- Updated dependencies [df19a4ed]
- Updated dependencies [470336a1]
- Updated dependencies [9005cc17]
  - @graphql-codegen/visitor-plugin-common@1.22.0
  - @graphql-codegen/plugin-helpers@1.18.8

## 1.18.4

### Patch Changes

- Updated dependencies [6762aff5]
  - @graphql-codegen/visitor-plugin-common@1.21.3

## 1.18.3

### Patch Changes

- Updated dependencies [6aaecf1c]
  - @graphql-codegen/visitor-plugin-common@1.21.2

## 1.18.2

### Patch Changes

- Updated dependencies [cf1e5abc]
  - @graphql-codegen/visitor-plugin-common@1.21.1

## 1.18.1

### Patch Changes

- Updated dependencies [dfd25caf]
- Updated dependencies [8da7dff6]
  - @graphql-codegen/visitor-plugin-common@1.21.0
  - @graphql-codegen/plugin-helpers@1.18.7

## 1.18.0

### Minor Changes

- 097bea2f: Added new configuration settings for scalars: `strictScalars` and `defaultScalarType`

### Patch Changes

- Updated dependencies [d9212aa0]
- Updated dependencies [f0b5ea53]
- Updated dependencies [097bea2f]
  - @graphql-codegen/visitor-plugin-common@1.20.0
  - @graphql-codegen/plugin-helpers@1.18.5

## 1.17.13

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/add@2.0.2
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.17.12

### Patch Changes

- eaf45d1f: fix issue with inline fragment without typeCondition
- Updated dependencies [612e5e52]
- Updated dependencies [9f2a4e2f]
- Updated dependencies [0f35e775]
- Updated dependencies [eaf45d1f]
  - @graphql-codegen/visitor-plugin-common@1.17.17
  - @graphql-codegen/plugin-helpers@1.18.1

## 1.17.11

### Patch Changes

- 29d2ab4f: Improve 'importAllFragmentsFrom' signature by adding the source file that requests the
  fragment
- Updated dependencies [07f9b1b2]
- Updated dependencies [35f67120]
  - @graphql-codegen/visitor-plugin-common@1.17.14

## 1.17.10

### Patch Changes

- ac6039da: Improve error messages when document validation fails

## 1.17.9

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL
  comments
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
- Updated dependencies [ac067ea0]
  - @graphql-codegen/visitor-plugin-common@1.17.13
  - @graphql-codegen/plugin-helpers@1.17.8
  - @graphql-codegen/add@2.0.1

## 1.17.8

### Patch Changes

- Updated dependencies [bc6e5c08]
- Updated dependencies [4266a15f]
  - @graphql-codegen/add@2.0.0
  - @graphql-codegen/visitor-plugin-common@1.17.12
