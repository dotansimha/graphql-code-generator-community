---
'@graphql-codegen/typescript-nhost': patch
---

Initial release

The `typescript-nhost` plugin generates the schema for the [`Typescript Nhost SDK`](https://docs.nhost.io/reference/javascript).

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
import { NhostClient } from '@nhost/nhost-js';
import schema from './schema';

const nhost = new NhostClient({ subdomain: 'localhost', schema });
```

A GraphQL query named `todos` will then be accessible through:

```ts
const todos = await nhost.graphql.query.todos({ select: { contents: true } });
```

The `todos` object will be strongly typed based on the GraphQL schema, and the fields that would have been selected in the query.
