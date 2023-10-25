# @graphql-codegen/hasura-allow-list

## 3.1.0

### Minor Changes

- [#452](https://github.com/dotansimha/graphql-code-generator-community/pull/452)
  [`0fea1a83e`](https://github.com/dotansimha/graphql-code-generator-community/commit/0fea1a83eaf42f56ea68ed5f763fe00f2df7417a)
  Thanks [@shoma-mano](https://github.com/shoma-mano)! - add config to change fragments definition
  order

## 3.0.0

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

## 2.0.0

### Major Changes

- [#8242](https://github.com/dotansimha/graphql-code-generator/pull/8242)
  [`7bee5c597`](https://github.com/dotansimha/graphql-code-generator/commit/7bee5c597466d53152776b1cca9085bd29af00cb)
  Thanks [@BenoitRanque](https://github.com/BenoitRanque)! - added support for global fragments
  breaking: changed config options to camelCase for consistency

## 1.1.1

### Patch Changes

- [#8189](https://github.com/dotansimha/graphql-code-generator/pull/8189)
  [`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f)
  Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix CommonJS TypeScript resolution with
  `moduleResolution` `node16` or `nodenext`

- Updated dependencies
  [[`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f)]:
  - @graphql-codegen/plugin-helpers@2.6.2

## 1.1.0

### Minor Changes

- d84afec09: Support TypeScript ESM modules (`"module": "node16"` and
  `"moduleResolution": "node16"`).

  [More information on the TypeScript Release Notes.](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)

### Patch Changes

- Updated dependencies [d84afec09]
- Updated dependencies [a4fe5006b]
- Updated dependencies [8e44df58b]
  - @graphql-codegen/plugin-helpers@2.5.0

## 1.0.1

### Patch Changes

- 7198a3cd3: feat: hasura allow list plugin

## 1.0.0

Initial release. Generate a query_collections.yaml
[hasura](https://hasura.io/docs/latest/graphql/cloud/security/allow-lists.html) metadata file based
on your graphql queries. Allows automation of the process of keeping allow lists up to date with
your front end application. Skips anonymous operations
