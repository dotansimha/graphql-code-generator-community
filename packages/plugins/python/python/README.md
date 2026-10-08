# @graphql-codegen/python

A **schema-driven** [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) plugin that
emits **Python base types** from a `GraphQLSchema`:

- object & interface types → [pydantic](https://docs.pydantic.dev) `BaseModel` classes (snake_case
  attributes; keys that differ from the GraphQL name are pinned with `Field(alias=...)` +
  `model_config = ConfigDict(populate_by_name=True)`)
- input types → `TypedDict`
- enums → `class X(str, Enum)`
- scalars → native Python (`ID`/`String` → `str`, `Int` → `int`, `Float` → `float`, `Boolean` →
  `bool`, custom → `Any`)

It is the base-types counterpart to `@graphql-codegen/python-operations`, analogous to how
`typescript` underpins `typescript-operations`.

## Config

| Option             | Type                    | Default       | Description                                                                                                                                   |
| ------------------ | ----------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseModel`        | `string`                | `'BaseModel'` | Base class the generated object/interface types extend.                                                                                       |
| `runtimeImport`    | `string`                | `'pydantic'`  | Module the base model is imported from (`from {runtimeImport} import {baseModel}`, with `ConfigDict`/`Field` appended when aliases are used). |
| `namingConvention` | `'keep' \| 'snakeCase'` | `'snakeCase'` | How field names become attributes (`snakeCase` converts and pins renamed keys with `Field(alias=...)`).                                       |
