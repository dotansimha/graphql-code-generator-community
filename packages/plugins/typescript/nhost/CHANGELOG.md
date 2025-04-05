# @graphql-codegen/typescript-nhost

## 0.0.3

### Patch Changes

- [#355](https://github.com/dotansimha/graphql-code-generator-community/pull/355)
  [`ca72b89`](https://github.com/dotansimha/graphql-code-generator-community/commit/ca72b89a601979799d0c10087535ff2acc4378f0)
  Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:

  - Updated dependency
    [`@graphql-codegen/visitor-plugin-common@3.1.1` ↗︎](https://www.npmjs.com/package/@graphql-codegen/visitor-plugin-common/v/3.1.1)
    (from `3.0.0`, in `dependencies`)

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

## 0.0.2

### Patch Changes

- [#422](https://github.com/dotansimha/graphql-code-generator-community/pull/422)
  [`ef0adf8c2`](https://github.com/dotansimha/graphql-code-generator-community/commit/ef0adf8c2124e4b40d23c52966486a887f122b9b)
  Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:
  - Updated dependency [`tslib@~2.6.0` ↗︎](https://www.npmjs.com/package/tslib/v/2.6.0) (from
    `~2.5.0`, in `dependencies`)

## 0.0.1

### Patch Changes

- [#269](https://github.com/dotansimha/graphql-code-generator-community/pull/269)
  [`d28569b9a`](https://github.com/dotansimha/graphql-code-generator-community/commit/d28569b9aaad4533966271b2ac5e6799e163827e)
  Thanks [@plmercereau](https://github.com/plmercereau)! - Initial release

  The `typescript-nhost` plugin generates the schema for the
  [`Typescript Nhost SDK`](https://docs.nhost.io/reference/javascript).

  What the plugin does:

  - Generate types with `graphql-codegem/typescript`, following a strict configuration. (the plugin
    does not require `@graphql-codegen/typescript` to be installed by the user but is use as a
    dependency).
  - Minify the introspection object with `'@urql/introspection`
  - Export the introspection object as well as all the types so they can be accessed through a
    default `import schema from './generated-schema'`

  ### Installation

  ```sh
  yarn add -D @graphql-codegen/cli @graphql-codegen/typescript-nhost
  ```

  Then configure the code generator by adding a `codegen.yaml` file:

  ```yaml filename="codegen.yaml"
  schema:
    - http://localhost:1337/v1/graphql:
        headers:
          x-hasura-admin-secret: nhost-admin-secret
  generates:
    ./src/schema.ts:
      plugins:
        - typescript-nhost
  ```

  ### Usage

  ```sh
  yarn add @nhost/nhost-js
  ```

  ```ts filename="src/main.ts"
  import { NhostClient } from '@nhost/nhost-js'
  import schema from './schema'

  const nhost = new NhostClient({ subdomain: 'localhost', schema })
  ```

  A GraphQL query named `todos` will then be accessible through:

  ```ts
  const todos = await nhost.graphql.query.todos({ select: { contents: true } })
  ```

  The `todos` object will be strongly typed based on the GraphQL schema, and the fields that would
  have been selected in the query.
