# @graphql-codegen/urql-introspection

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

## 2.2.1

### Patch Changes

- [#8189](https://github.com/dotansimha/graphql-code-generator/pull/8189)
  [`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f)
  Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix CommonJS TypeScript resolution with
  `moduleResolution` `node16` or `nodenext`

- Updated dependencies
  [[`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f)]:
  - @graphql-codegen/plugin-helpers@2.6.2

## 2.2.0

### Minor Changes

- d84afec09: Support TypeScript ESM modules (`"module": "node16"` and
  `"moduleResolution": "node16"`).

  [More information on the TypeScript Release Notes.](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)

### Patch Changes

- Updated dependencies [d84afec09]
- Updated dependencies [a4fe5006b]
- Updated dependencies [8e44df58b]
  - @graphql-codegen/plugin-helpers@2.5.0

## 2.1.1

### Patch Changes

- 8643b3bf3: Add GraphQL 16 as a peerDependency
- 6002feb3d: Fix exports in package.json files for react-native projects
- Updated dependencies [6002feb3d]
  - @graphql-codegen/plugin-helpers@2.3.2

## 2.1.0

### Minor Changes

- 440172cfe: support ESM

### Patch Changes

- Updated dependencies [24185985a]
- Updated dependencies [39773f59b]
- Updated dependencies [440172cfe]
  - @graphql-codegen/plugin-helpers@2.1.0

## 2.0.0

### Major Changes

- b0cb13df4: Update to latest `graphql-tools` and `graphql-config` version.

  ‼️ ‼️ ‼️ Please note ‼️ ‼️ ‼️:

  This is a breaking change since Node 10 is no longer supported in `graphql-tools`, and also no
  longer supported for Codegen packages.

### Patch Changes

- Updated dependencies [b0cb13df4]
  - @graphql-codegen/plugin-helpers@2.0.0

## 1.3.1

### Patch Changes

- 794222ea: Fixed include functionality in urql-introspection

## 1.3.0

### Minor Changes

- 3736a3b2: feat(urql-introspection): add more options

### Patch Changes

- Updated dependencies [637338cb]
  - @graphql-codegen/plugin-helpers@1.18.6

## 1.2.0

### Minor Changes

- 57f33b7e: Implemented `useTypeImports` plugin config setting conforming to other plugin usage

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- Updated dependencies [d9212aa0]
  - @graphql-codegen/plugin-helpers@1.18.5

## 1.1.0

### Major Changes

- d3ad189f: useTypeImports setting should now be respected

## 1.0.0

### Major Changes

- f1688ba7: New Plugin: Urql Introspection
