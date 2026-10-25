# @graphql-codegen/python-operations

A **document-driven** [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) plugin that
emits **Python operation types**: for each operation in your documents it generates per-operation
result [pydantic](https://docs.pydantic.dev) `BaseModel` classes (named, nested classes for every
object selection) plus a `<Operation>Variables` `TypedDict` keyed by the wire (GraphQL) variable
names. Renamed response keys are pinned with `Field(alias=...)` and a
`model_config = ConfigDict(populate_by_name=True)`.

It is the operations counterpart to `@graphql-codegen/python` (which emits base schema types),
analogous to how `typescript-operations` complements `typescript`.

## Example

Schema:

```graphql
enum Role {
  ADMIN
  USER
}
type User {
  id: ID!
  name: String!
  role: Role!
  friends: [User!]!
}
type Query {
  users(role: Role): [User!]!
}
```

Operation:

```graphql
query GetUsers($role: Role) {
  users(role: $role) {
    id
    name
    role
    friends {
      id
      name
    }
  }
}
```

Output:

```python
from typing import Optional, TypedDict
from pydantic import BaseModel


class GetUsersQueryUsersFriends(BaseModel):
    id: 'str'
    name: 'str'


class GetUsersQueryUsers(BaseModel):
    id: 'str'
    name: 'str'
    role: 'Role'
    friends: 'list[GetUsersQueryUsersFriends]'


class GetUsersQuery(BaseModel):
    users: 'list[GetUsersQueryUsers]'


class GetUsersQueryVariables(TypedDict):
    role: 'Optional[Role]'
```

Result types are pydantic `BaseModel` subclasses; the `<Operation>Variables` type stays a
`TypedDict`. When a response key is renamed (snake_case or a reserved keyword), that attribute is
pinned with `Field(alias='<wireName>')` and the class gets
`model_config = ConfigDict(populate_by_name=True)`.

## Config

| Option             | Type                    | Default       | Description                                                                                                                                                                                                                                     |
| ------------------ | ----------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `namingConvention` | `'keep' \| 'snakeCase'` | `'snakeCase'` | How response keys become result-class attributes. `snakeCase` converts camelCase→snake*case, suffixes reserved keywords with `*`, and pins renamed keys via `Field(alias=...)`. `keep` uses keys verbatim. Variables always keep the wire name. |
| `baseModel`        | `string`                | `'BaseModel'` | Base class the generated result types extend.                                                                                                                                                                                                   |
| `runtimeImport`    | `string`                | `'pydantic'`  | Module the base model is imported from (`from {runtimeImport} import {baseModel}`, with `ConfigDict`/`Field` appended when aliases are used).                                                                                                   |
| `typesImport`      | `string`                | –             | If set, prepend `from {typesImport} import *` so base type names (enums, inputs) resolve at runtime.                                                                                                                                            |

## Behaviour / naming

- Result root type: `<OperationName><OperationType>` (e.g. `GetUsersQuery`).
- Nested object selections: `<ParentTypeName><PascalCase(responseFieldName)>`.
- Variables type: `<OperationName><OperationType>Variables`.
- Field names are `snake_case`; Python reserved keywords get a trailing `_`.
- Aliases use the alias as the response key; `__typename` becomes `__typename__`.
- Every annotation is quoted (forward reference), so emit order does not matter.

## Not (yet) supported

Fragment spreads, inline fragments and union member (`... on Type`) selections are not yet
implemented. Rather than silently omitting their fields (which would produce a result type that
looks valid but is missing data), the plugin **throws a clear error** at generate time if an
operation contains one — inline the fields directly into the operation for now. See
`src/python-helpers.ts` for the duplicated naming helpers (TODO: extract to a shared
`@graphql-codegen/python-common` package).
