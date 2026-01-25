<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=GraphQL%20URQL%20Codegen&background=tiles&project=%20" alt="Solid Primitives">
</p>

# GraphQL Code Generator Plugin for Solid and URQL

A GraphQL Code Generator plugin that generates fully typed Solid primitives for URQL, including `createQuery`, `createMutation`, and `createSubscription`.

> **Note:** This plugin is for client-side Solid applications. If you're building a SolidStart application with SSR, use [`@graphql-codegen/typescript-solidstart-urql`](https://github.com/yourusername/graphql-codegen-solidstart-urql) instead. See the [comparison documentation](https://github.com/yourusername/graphql-codegen-solidstart-urql/blob/main/COMPARISON.md) for differences between the two plugins.

## Installation

**npm:**
```bash
npm install --save-dev @graphql-codegen/typescript-solid-urql
npm install --save-dev @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations
npm install solid-urql @urql/core graphql
# or
pnpm add -D @graphql-codegen/typescript-solid-urql @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations
pnpm add @urql/solid @urql/core graphql
# or
yarn add -D @graphql-codegen/typescript-solid-urql @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations
yarn add @urql/solid @urql/core graphql
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
      - "typescript-solid-urql"
    config:
      withPrimitives: true
      urqlImportFrom: "solid-urql"
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
        'typescript-solid-urql'
      ],
      config: {
        withPrimitives: true,
        urqlImportFrom: 'solid-urql'
      }
    }
  }
};

export default config;
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `withPrimitives` | `boolean` | `true` | Enable/disable generation of Solid primitives (wrappers around `createQuery`, `createMutation`, etc.) |
| `urqlImportFrom` | `string` | `'solid-urql'` | The module to import `createQuery`, `createMutation`, etc. from |

### `withPrimitives` Option

- **`true` (default)**: Generates wrapper functions for each operation, providing a convenient API
- **`false`**: Only generates TypeScript types and document strings, allowing you to use `createQuery`/`createMutation` directly

## Usage

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
export const useCreateGetUser = (args: Omit<CreateQueryArgs<GetUserQueryVariables, GetUserQuery>, 'query'>) => {
  return createQuery<GetUserQuery, GetUserQueryVariables>({
    ...args,
    query: GetUserDocument,
  });
};
```

### Using in Your Solid Component

```tsx
import { Component } from 'solid-js';
import { useCreateGetUser } from './generated/graphql';

const UserProfile: Component<{ userId: string }> = (props) => {
  const [result] = useCreateGetUser({
    variables: { id: props.userId }
  });

  return (
    <div>
    <Suspense>
        <Show fallback={<p>Error: {result().error.message}</p>} when={!result().error }>
          <ul>
            <For each={result().data.users}>
              {(user) => <li>{user.name} - {user.email}</li>}
            </For>
          </ul>
        </Show>
      </Suspense>
    </div>
  );
};
```

### Mutations

Given a GraphQL mutation:

```graphql
mutation UpdateUser($id: ID!, $name: String!) {
  updateUser(id: $id, name: $name) {
    id
    name
    email
  }
}
```

The plugin generates:

```typescript
export const useCreateUpdateUser = () => {
  return createMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument);
};
```

Using in your component:

```tsx
import { Component } from 'solid-js';
import { useCreateUpdateUser } from './generated/graphql';

const UpdateUserForm: Component = () => {
  const [, executeMutation] = useCreateUpdateUser();

  const handleSubmit = async (name: string) => {
    const result = await executeMutation({ 
      id: '123', 
      name 
    });
    
    if (result.data) {
      console.log('User updated:', result.data.updateUser);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleSubmit(formData.get('name') as string);
    }}>
      <input name="name" type="text" />
      <button type="submit">Update</button>
    </form>
  );
};
```

### Subscriptions

Given a GraphQL subscription:

```graphql
subscription OnUserUpdated($userId: ID!) {
  userUpdated(userId: $userId) {
    id
    name
    email
  }
}
```

The plugin generates:

```typescript
export const useCreateOnUserUpdated = (args: Omit<CreateQueryArgs<OnUserUpdatedSubscriptionVariables, OnUserUpdatedSubscription>, 'query'>) => {
  return createSubscription<OnUserUpdatedSubscription, OnUserUpdatedSubscriptionVariables>({
    ...args,
    query: OnUserUpdatedDocument,
  });
};
```

## Complete Setup Example

1. Install dependencies:

```bash
npm install solid-urql @urql/core graphql
npm install --save-dev @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-solid-urql
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
      - "typescript-solid-urql"
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
```

5. Run code generation:

```bash
npm run codegen
```

6. Set up your Solid app with URQL:

```typescript
import { render } from 'solid-js/web';
import { createClient, Provider } from 'solid-urql';
import App from './App';

const client = createClient({
  url: 'https://your-graphql-endpoint.com/graphql',
});

render(
  () => (
    <Provider value={client}>
      <App />
    </Provider>
  ),
  document.getElementById('root')!
);
```

7. Use the generated hooks in your components:

```tsx
import { Component, For, Suspense } from 'solid-js';
import { useCreateGetUsers } from './generated/graphql';

const UserList: Component = () => {
  const [result] = useCreateGetUsers({});

  return (
    <div>
      <Suspense>
        <Show fallback={<p>Error: {result().error.message}</p>} when={!result().error }>
          <ul>
            <For each={result().data.users}>
              {(user) => <li>{user.name} - {user.email}</li>}
            </For>
          </ul>
        </Show>
      </Suspense>
    </div>
  );
};
```

## Features

- ✅ Fully typed queries, mutations, and subscriptions
- ✅ TypeScript support
- ✅ Generates Solid-specific hooks using `createQuery`, `createMutation`, `createSubscription`
- ✅ Proper handling of required vs optional variables
- ✅ Compatible with solid-urql and @urql/core

## Related Resources

- [GraphQL Code Generator Documentation](https://the-guild.dev/graphql/codegen)
- [solid-urql Documentation](https://github.com/urql-graphql/urql/tree/main/packages/solid-urql)
- [URQL Documentation](https://formidable.com/open-source/urql/)
- [Solid Documentation](https://www.solidjs.com/)

## License

MIT
