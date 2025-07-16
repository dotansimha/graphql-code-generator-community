# @graphql-codegen/c-sharp-common

## 1.2.0

### Minor Changes

- [#1160](https://github.com/dotansimha/graphql-code-generator-community/pull/1160)
  [`dcbb0ef`](https://github.com/dotansimha/graphql-code-generator-community/commit/dcbb0ef50a25d784fbb405816e93dc060de1c5ed)
  Thanks [@ocdi](https://github.com/ocdi)! - Support output of System.Text.Json attributes

### Patch Changes

- [#1158](https://github.com/dotansimha/graphql-code-generator-community/pull/1158)
  [`d6c8b90`](https://github.com/dotansimha/graphql-code-generator-community/commit/d6c8b90335ce30c792c61fcf9106adecf83f8a01)
  Thanks [@ocdi](https://github.com/ocdi)! - Fully qualify enum attributes

## 1.1.1

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

## 1.1.0

### Minor Changes

- [#816](https://github.com/dotansimha/graphql-code-generator-community/pull/816)
  [`b1ec118`](https://github.com/dotansimha/graphql-code-generator-community/commit/b1ec1187507089362301b874546bf08dd4c8aec3)
  Thanks [@mariusmuntean](https://github.com/mariusmuntean)! - Added support for the new
  configuration option `memberNameConvention` to the c-sharp-operations plugin. Now both C# plugins
  can generate C# code with standard member casing. The default is still camel case, to avoid
  generating code that breaks user's existing code base.

### Patch Changes

- [#820](https://github.com/dotansimha/graphql-code-generator-community/pull/820)
  [`581e733`](https://github.com/dotansimha/graphql-code-generator-community/commit/581e733d6ede02261f89c332c1e3fd4621d34ddc)
  Thanks [@mariusmuntean](https://github.com/mariusmuntean)! - upgrade dependencies and fix type
  errors

## 1.0.0

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

## 0.1.1

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

## 0.1.0

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
  - @graphql-codegen/plugin-helpers@2.5.0
