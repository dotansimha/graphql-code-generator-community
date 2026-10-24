# `@graphql-codegen/python-common`

Shared Python-specific helpers for the `@graphql-codegen/python` plugin family (`python`,
`python-operations`): the naming knowledge those plugins must agree on so their generated classes
line up exactly, kept in one place.

Modeled on `@graphql-codegen/c-sharp-common` / `@graphql-codegen/java-common`, which play the same
role for their respective language families.

## What's here

- **`PYTHON_KEYWORDS`** / **`PY_IDENT_RE`** / **`isValidClassAttr`** — the CPython reserved-word set
  (incl. the soft keywords `match`/`case`) and identifier validation used to decide when a GraphQL
  name needs escaping.
- **`PYTHON_SCALARS`** — the default GraphQL scalar → Python type mapping (custom scalars fall back
  to `Any`).
- **`pythonFieldName`** / **`isReservedField`** — convert a GraphQL name to `snake_case` for use as
  a Python identifier, escaping reserved keywords with a trailing `_`.
- **`pascalCase`** / **`constantCase`** — the class-name and document-constant casing helpers,
  re-exported from `change-case-all`.

This package is the **single place in the family that depends on `change-case-all`**:
`pythonFieldName`, `pascalCase`, and `constantCase` all route through it, so every plugin gets the
same acronym-splitting behavior (`GetHTTPStatus` → `GetHttpStatus` / `get_http_status`) and no
consumer imports `change-case-all` or hand-rolls the rules itself. `python` and `python-operations`
get PascalCase names from `BaseVisitor.convertName` (which uses `change-case-all`); a plugin that
doesn't extend the base visitor can use the `pascalCase` / `constantCase` exported here to produce
byte-identical names.
