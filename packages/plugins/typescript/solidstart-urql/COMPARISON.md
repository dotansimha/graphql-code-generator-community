# Comparison: typescript-solidstart-urql vs typescript-solid-urql

This document explains the differences between the two URQL plugins for SolidJS ecosystems.

## Package Comparison

| Feature | typescript-solid-urql | typescript-solidstart-urql |
|---------|----------------------|---------------------------|
| **Target Framework** | Solid (client-side) | SolidStart (SSR framework) |
| **Import Source** | `solid-urql` | `@urql/solid-start` |
| **Query Generation** | ✅ Yes (`createQuery`) | ✅ Yes (`createQuery`) |
| **Mutation Generation** | ✅ Yes (`createMutation`) | ✅ Yes (`createMutation` with actions) |
| **Subscription Generation** | ✅ Yes (`createSubscription`) | ✅ Yes (`createSubscription`) |
| **SSR Optimized** | ❌ No | ✅ Yes |
| **Action Integration** | ❌ No | ✅ Yes (SolidStart actions) |

## When to Use Each Plugin

### Use `typescript-solid-urql` when:
- Building a pure client-side Solid application
- Need subscriptions code generation
- Not using SolidStart framework
- Want client-side reactive patterns

### Use `typescript-solidstart-urql` when:
- Building a SolidStart application with SSR
- Want integration with SolidStart's routing and action patterns
- Need server-side rendering for queries
- Want progressive enhancement for mutations via actions

## Code Generation Differences

### typescript-solid-urql Output

```typescript
// Generates for Queries
export const useGetUserQuery = (args: Omit<CreateQueryArgs<...>, 'query'>) => {
  return createQuery<GetUserQuery, GetUserQueryVariables>({
    ...args,
    query: GetUserDocument,
  });
};

// Generates for Mutations
export const useCreateUserMutation = () => {
  return createMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument);
};

// Generates for Subscriptions
export const useOnUserUpdatedSubscription = (args: Omit<CreateQueryArgs<...>, 'query'>) => {
  return createSubscription<OnUserUpdatedSubscription, OnUserUpdatedSubscriptionVariables>({
    ...args,
    query: OnUserUpdatedDocument,
  });
};
```

### typescript-solidstart-urql Output

```typescript
// Generates for Queries
export const queryGetUser = createQuery<GetUserQuery, GetUserQueryVariables>(
  GetUserDocument,
  'get-user'
);

// Generates for Mutations (as action wrappers)
export const actionCreateUser = () => createMutation<CreateUserMutation, CreateUserMutationVariables>(
  CreateUserDocument,
  'create-user'
);

// Does NOT generate for Subscriptions
// Use createSubscription directly from @urql/solid-start
```

## Usage Pattern Differences

### typescript-solid-urql (Client-Side)

```tsx
import { Component } from 'solid-js';
import { useGetUserQuery, useCreateUserMutation } from './generated/graphql';

const UserProfile: Component = () => {
  const [user] = useGetUserQuery({ variables: { id: '1' } });
  const [state, createUser] = useCreateUserMutation();

  const handleCreate = async () => {
    await createUser({ name: 'John', email: 'john@example.com' });
  };

  return <div>{/* component code */}</div>;
};
```

### typescript-solidstart-urql (SSR with Actions)

```tsx
import { createAsync, useAction, useSubmission } from '@solidjs/router';
import { queryGetUser, actionCreateUser } from '~/generated/graphql';

export default function UserProfile() {
  // Query with SSR support
  const user = createAsync(() => queryGetUser({ id: '1' }));
  
  // Mutation with SolidStart action
  const createUserAction = actionCreateUser();
  const createUser = useAction(createUserAction);
  const submission = useSubmission(createUserAction);

  const handleCreate = async () => {
    await createUser({ name: 'John', email: 'john@example.com' });
  };

  return (
    <div>
      {/* Use user() and submission.pending */}
    </div>
  );
}
```

## Configuration Differences

Both plugins use the same configuration structure:

```yaml
# Both plugins
config:
  withPrimitives: true
  urqlImportFrom: "solid-urql"        # for solid-urql plugin
  # or
  urqlImportFrom: "@urql/solid-start"  # for solidstart-urql plugin
```

## Key Differences

### Queries
- **solid-urql**: Returns `createQuery` result directly (tuple with state)
- **solidstart-urql**: Returns a query function to use with `createAsync()`

### Mutations
- **solid-urql**: Returns `createMutation` result directly (tuple with state and execute)
- **solidstart-urql**: Returns an action factory that creates SolidStart actions
  - Must call the action factory in your component
  - Use with `useAction()` and `useSubmission()` for progressive enhancement

### Subscriptions
- **solid-urql**: Generates subscription helpers
- **solidstart-urql**: Does not generate (use `createSubscription` from `@urql/solid-start` directly)

## Migration Between Plugins

If migrating from `typescript-solid-urql` to `typescript-solidstart-urql`:

### Queries
```tsx
// Before (with typescript-solid-urql)
import { useGetUserQuery } from './generated/graphql';
const [user] = useGetUserQuery({ variables: { id: '1' } });

// After (with typescript-solidstart-urql)
import { createAsync } from '@solidjs/router';
import { queryGetUser } from './generated/graphql';
const user = createAsync(() => queryGetUser({ id: '1' }));
```

### Mutations
```tsx
// Before (with typescript-solid-urql)
import { useCreateUserMutation } from './generated/graphql';
const [state, createUser] = useCreateUserMutation();

// After (with typescript-solidstart-urql)
import { useAction, useSubmission } from '@solidjs/router';
import { actionCreateUser } from './generated/graphql';
const createUserAction = actionCreateUser();
const createUser = useAction(createUserAction);
const submission = useSubmission(createUserAction);
```

### Subscriptions
```tsx
// Before (with typescript-solid-urql)
import { useOnUserUpdatedSubscription } from './generated/graphql';
const [messages] = useOnUserUpdatedSubscription();

// After (with typescript-solidstart-urql)
import { createSubscription } from '@urql/solid-start';
import { OnUserUpdatedDocument } from './generated/graphql';
const [messages] = createSubscription({ query: OnUserUpdatedDocument });
```

## Architecture Rationale

### Why typescript-solidstart-urql Uses Actions for Mutations

1. **Progressive Enhancement**: SolidStart actions work without JavaScript
2. **SSR Integration**: Actions integrate with SolidStart's form handling
3. **Type Safety**: Generated actions maintain full type safety
4. **Router Integration**: Actions work with `useSubmission()` for loading states

### Why Different Query Patterns

1. **SSR First**: SolidStart queries run on server and stream to client
2. **Caching**: Integration with SolidStart's router-level caching
3. **Suspense**: Works with Solid Suspense boundaries
4. **createAsync**: Designed for SolidStart's data fetching patterns

## Recommendation

- **New SolidStart Project**: Use `typescript-solidstart-urql`
- **New Solid SPA**: Use `typescript-solid-urql`
- **Existing Project**: Choose based on whether you use SolidStart's SSR and routing features
