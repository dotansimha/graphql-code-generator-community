<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=SolidStart%20GraphQL%20URQL%20Codegen&background=tiles&project=%20" alt="Solid Primitives">
</p>

# GraphQL Code Generator Plugin for SolidStart and URQL

A GraphQL Code Generator plugin that generates fully typed SolidStart URQL primitives for queries and mutations. Works seamlessly with SolidStart's `createAsync`, `query`, and `action` primitives.

> **Note:** SolidStart uses different primitives than Solid. See [COMPARISON.md](./COMPARISON.md) for differences between this plugin and `typescript-solid-urql`.

## Installation

**npm:**
```bash
npm install --save-dev @graphql-codegen/typescript-solidstart-urql
npm install --save-dev @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations
npm install @urql/solid-start @urql/solid @urql/core graphql
# or
pnpm add -D @graphql-codegen/typescript-solidstart-urql @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations
pnpm add @urql/solid-start @urql/solid @urql/core graphql
# or
yarn add -D @graphql-codegen/typescript-solidstart-urql @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations
yarn add @urql/solid-start @urql/solid @urql/core graphql
```

## Configuration

Add the plugin to your GraphQL Code Generator configuration:

### codegen.yml

```yaml
overwrite: true
schema: "https://your-graphql-endpoint.com/graphql"
documents: "src/**/*.graphql"
generates:
  src/generated/graphql.ts:
    plugins:
      - "typescript"
      - "typescript-operations"
      - "typescript-solidstart-urql"
    config:
      withPrimitives: true
      urqlImportFrom: "@urql/solid-start"
```

### codegen.ts

```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'https://your-graphql-endpoint.com/graphql',
  documents: 'src/**/*.graphql',
  generates: {
    'src/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-solidstart-urql'
      ],
      config: {
        withPrimitives: true,
        urqlImportFrom: '@urql/solid-start'
      }
    }
  }
};

export default config;
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `withPrimitives` | `boolean` | `true` | Enable/disable generation of SolidStart query primitives (wrappers around `createQuery`) |
| `urqlImportFrom` | `string` | `'@urql/solid-start'` | The module to import `createQuery` from |

### `withPrimitives` Option

- **`true` (default)**: Generates wrapper functions for each query operation, providing a convenient API
- **`false`**: Only generates TypeScript types and document strings, allowing you to use `createQuery` directly

**Note:** This plugin generates `query*` functions for Query operations, `action*` functions for Mutation operations, and `subscription*` functions for Subscription operations.

## Usage

### 1. Set up the Provider

Wrap your app with the `Provider` and pass both `client` and `query`:

```tsx
// src/app.tsx
import { Router, query } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Provider } from '@urql/solid-start';
import { createClient, cacheExchange, fetchExchange } from '@urql/core';

const client = createClient({
  url: 'https://your-graphql-endpoint.com/graphql',
  exchanges: [cacheExchange, fetchExchange],
});

export default function App() {
  return (
    <Router
      root={props => (
        <Provider value={{ client, query }}>
          {props.children}
        </Provider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
```

### 2. Use Generated Queries

Given the following GraphQL query:

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}
```

The plugin will generate:

```typescript
export const queryGetUser = createQuery(GetUserDocument, 'get-user');
```

Use it in your SolidStart route with `createAsync`:

```tsx
// src/routes/users/[id].tsx
import { useParams } from '@solidjs/router';
import { createAsync } from '@solidjs/router';
import { Show, Suspense } from 'solid-js';
import { queryGetUser } from '~/generated/graphql';

export default function UserPage() {
  const params = useParams();
  
  // Use createAsync with the generated query function
  const user = createAsync(() => queryGetUser({ id: params.id }));

  return (
    <div>
      <h1>User Profile</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <Show when={user()?.data}>
          <div>
            <h2>{user()!.data.user.name}</h2>
            <p>Email: {user()!.data.user.email}</p>
          </div>
        </Show>
        <Show when={user()?.error}>
          <p>Error: {user()!.error.message}</p>
        </Show>
      </Suspense>
    </div>
  );
}
```

> **Note:** You can optionally pass a custom client as the first parameter: `queryGetUser(customClient, { id: params.id })`, but it's not necessary - the query function will use `useClient()` internally if no client is provided.

### Query without variables

For queries without variables:

```graphql
query GetUsers {
  users {
    id
    name
    email
  }
}
```

Generated code:

```typescript
export const queryGetUsers = createQuery(GetUsersDocument, 'get-users');
```

Usage:

```tsx
import { createAsync } from '@solidjs/router';
import { queryGetUsers } from '~/generated/graphql';
import { For, Show, Suspense } from 'solid-js';

export default function UsersPage() {
  const users = createAsync(() => queryGetUsers());

  return (
    <div>
      <h1>Users</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <Show when={users()?.data}>
          <ul>
            <For each={users()!.data.users}>
              {user => <li>{user.name} - {user.email}</li>}
            </For>
          </ul>
        </Show>
      </Suspense>
    </div>
  );
}
```

## Complete Setup Example

1. Install dependencies:

```bash
npm install @urql/solid-start @urql/solid @urql/core graphql
npm install --save-dev @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-solidstart-urql
```

2. Create `codegen.yml`:

```yaml
overwrite: true
schema: "https://your-graphql-endpoint.com/graphql"
documents: "src/**/*.graphql"
generates:
  src/generated/graphql.ts:
    plugins:
      - "typescript"
      - "typescript-operations"
      - "typescript-solidstart-urql"
```

3. Add script to `package.json`:

```json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.yml"
  }
}
```

4. Create a GraphQL query file `src/queries/users.graphql`:

```graphql
query GetUsers {
  users {
    id
    name
    email
  }
}

query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      id
      title
    }
  }
}
```

5. Run code generation:

```bash
npm run codegen
```

6. Set up your SolidStart app with URQL in `src/app.tsx`:

```typescript
import { Router, query } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import { Provider } from '@urql/solid-start';
import { createClient, cacheExchange, fetchExchange } from '@urql/core';

const client = createClient({
  url: 'https://your-graphql-endpoint.com/graphql',
  exchanges: [cacheExchange, fetchExchange],
});

export default function App() {
  return (
    <Router
      root={props => (
        <Provider value={{ client, query }}>
          <Suspense>{props.children}</Suspense>
        </Provider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
```

7. Use the generated query functions in your routes:

```tsx
// src/routes/users/[id].tsx
import { useParams } from '@solidjs/router';
import { createAsync } from '@solidjs/router';
import { For, Show, Suspense } from 'solid-js';
import { queryGetUser } from '~/generated/graphql';

export default function UserPage() {
  const params = useParams();
  const user = createAsync(() => queryGetUser({ id: params.id }));

  return (
    <main>
      <Suspense fallback={<p>Loading user...</p>}>
        <Show when={user()?.data?.user}>
          {u => (
            <div>
              <h1>{u().name}</h1>
              <p>Email: {u().email}</p>
              <h2>Posts</h2>
              <ul>
                <For each={u().posts}>
                  {post => <li>{post.title}</li>}
                </For>
              </ul>
            </div>
          )}
        </Show>
        <Show when={user()?.error}>
          <p>Error: {user()!.error.message}</p>
        </Show>
      </Suspense>
    </main>
  );
}
```

## Features

- ✅ Fully typed queries with TypeScript
- ✅ Generates SolidStart-specific `createQuery` wrappers  
- ✅ Generates `action*` functions for mutations with SolidStart actions
- ✅ Generates `useSubscription*` functions for real-time updates
- ✅ Works seamlessly with `createAsync` for SSR
- ✅ Proper handling of required vs optional variables
- ✅ Compatible with @urql/solid-start and @urql/core
- ✅ Optimized for server-side rendering in SolidStart
- ✅ Automatic integration with SolidStart's `query` primitive

## Generated Primitives

### Queries
For GraphQL queries, the plugin generates `query*` functions using `createQuery`:

```typescript
export const queryGetUser = createQuery<GetUserQuery, GetUserQueryVariables>(
  GetUserDocument,
  'get-user'
);
```

Usage:
```tsx
const user = createAsync(() => queryGetUser({ id: '1' }));
```

### Mutations
For GraphQL mutations, the plugin generates `action*` functions that wrap `createMutation`:

```typescript
export const actionCreateUser = () => createMutation<CreateUserMutation, CreateUserMutationVariables>(
  CreateUserDocument,
  'create-user'
);
```

Usage:
```tsx
import { useAction, useSubmission } from '@solidjs/router';
import { actionCreateUser } from '~/generated/graphql';

export function CreateUserForm() {
  const createUserAction = actionCreateUser();
  const createUser = useAction(createUserAction);
  const submission = useSubmission(createUserAction);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    await createUser({ name: 'John', email: 'john@example.com' });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={submission.pending}>
        {submission.pending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

### Subscriptions

For GraphQL subscriptions, the plugin generates `useSubscription*` functions:

```typescript
export const useSubscriptionOnMessageAdded = (args: Omit<CreateQueryArgs<...>, 'query'>) => {
  return createSubscription<OnMessageAddedSubscription, OnMessageAddedSubscriptionVariables>({
    ...args,
    query: OnMessageAddedDocument,
  });
};
```

**Note:** Subscriptions use `createSubscription` from `@urql/solid` since the implementation is the same on both client and server.

#### Simple Example

Given this GraphQL subscription:

```graphql
subscription OnMessageAdded {
  messageAdded {
    id
    text
    user {
      name
    }
  }
}
```

Use it in your component:

```tsx
import { useSubscriptionOnMessageAdded } from '~/generated/graphql';
import { For, createSignal } from 'solid-js';

export function LiveMessages() {
  const [messages, setMessages] = createSignal([]);

  const [state] = useSubscriptionOnMessageAdded({}, (prev, response) => {
    setMessages(msgs => [...msgs, response.messageAdded]);
    return response;
  });

  return (
    <div>
      <h2>Live Messages</h2>
      <For each={messages()}>
        {msg => <div>{msg.user.name}: {msg.text}</div>}
      </For>
    </div>
  );
}
```

## How It Works

The plugin generates wrapper functions that call `createQuery` from `@urql/solid-start`. Each generated function:

1. Takes an optional client as first parameter (or uses `useClient()`)
2. Takes variables as parameter (if the query has variables)
3. Returns a query function compatible with SolidStart's `createAsync`
4. Includes proper TypeScript types for data and variables

## Related Resources

- [GraphQL Code Generator Documentation](https://the-guild.dev/graphql/codegen)
- [@urql/solid-start Documentation](https://github.com/urql-graphql/urql/tree/main/packages/solid-start-urql)
- [URQL Documentation](https://formidable.com/open-source/urql/)
- [SolidStart Documentation](https://start.solidjs.com/)
- [Solid Documentation](https://www.solidjs.com/)

## License

MIT
