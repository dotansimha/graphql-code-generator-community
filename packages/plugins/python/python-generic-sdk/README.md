# @graphql-codegen/python-generic-sdk

A [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) plugin that emits a **Python SDK**
from your GraphQL operation documents, modeled on the community
[`typescript-generic-sdk`](https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-generic-sdk)
plugin.

For every named operation in your documents it emits:

- a module-level document constant (`GET_USERS_DOCUMENT`) holding the printed operation string,
- a `Requester` [`typing.Protocol`](https://docs.python.org/3/library/typing.html#typing.Protocol),
- a `get_sdk(requester)` factory returning an object with **one method per operation**
  (`get_users(variables=..., options=...)`).

It is **document-driven** (like `typescript-generic-sdk`): it iterates `OperationDefinition` nodes
and prints each with graphql's `print`.

## Naming

Type references are generated to line up **exactly** with
[`@graphql-codegen/python-operations`](../python-operations) so the emitted annotations resolve
against the classes that plugin generates:

| Thing          | Rule                                                    | Example                  |
| -------------- | ------------------------------------------------------- | ------------------------ |
| Result type    | `pascalCase(op) + pascalCase(operationType)`            | `GetUsersQuery`          |
| Variables type | result type + `Variables`                               | `GetUsersQueryVariables` |
| Method name    | `snake_case(op)` (reserved keywords get a trailing `_`) | `get_users`              |
| Document const | `CONSTANT_CASE(op) + _DOCUMENT`                         | `GET_USERS_DOCUMENT`     |

## Usage

Run it alongside `@graphql-codegen/python` (base schema types) and
`@graphql-codegen/python-operations` (per-operation result/variables types) so the generated SDK's
annotations resolve:

```ts
// codegen.ts
const config = {
  generates: {
    'sdk.py': {
      plugins: [
        '@graphql-codegen/python',
        '@graphql-codegen/python-operations',
        '@graphql-codegen/python-generic-sdk'
      ]
    }
  }
}
```

## Config

| Option         | Type      | Default | Description                                                                                                     |
| -------------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| `asyncMethods` | `boolean` | `true`  | Emit `async` methods and an `async` `Requester` protocol that `await` the requester. Set `false` for sync form. |

Requesters typically wrap an asynchronous transport, so by default the generated methods are `async`
and `await` the requester before hydrating:

```python
class Requester(Protocol):
    async def __call__(self, doc: str, variables: 'Any' = None, options: 'Any' = None) -> 'Any':
        ...

def get_sdk(requester: Requester):
    class Sdk:
        async def get_users(self, variables: 'GetUsersQueryVariables' = None, options: 'Any' = None) -> 'GetUsersQuery':
            return GetUsersQuery.model_validate(await requester(GET_USERS_DOCUMENT, variables, options))
    return Sdk()
```

## Notes / scope

- Fragments are **deferred**: inlining a fragment's fields into the printed document isn't
  implemented yet. Rather than emitting a document that references an undefined fragment (which the
  server would reject at request time), the plugin **throws a clear error** at generate time if an
  operation contains a fragment spread or inline fragment — inline the fields directly into the
  operation for now.
- Anonymous operations are rejected with a clear error, matching `typescript-generic-sdk`.
