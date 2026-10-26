import { RawTypesConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates Python types based on your `GraphQLSchema`.
 *
 * It generates idiomatic Python for your entire schema:
 * - object & interface types become [pydantic](https://docs.pydantic.dev)
 *   `BaseModel` classes with snake_case attributes; each field whose Python name
 *   differs from the GraphQL key is pinned with `Field(alias=...)` so pydantic
 *   hydrates the wire (camelCase) key onto the attribute,
 * - input types become `TypedDict`s keyed by the WIRE (GraphQL) name — inputs
 *   are sent to the server as-is, so their keys are never snake-cased,
 * - enums become `str, Enum` classes,
 * - scalars are mapped to native Python types.
 *
 * By default object / interface field names are converted to snake_case (see
 * `namingConvention`). Every annotation is quoted so forward / recursive
 * references resolve without ordering constraints.
 */
export interface PythonPluginConfig extends RawTypesConfig {
  /**
   * @description The base class that generated object and interface types extend.
   * @default "BaseModel"
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    generates: {
   *      'schema.py': {
   *        plugins: ['@graphql-codegen/python'],
   *        config: {
   *          baseModel: 'BaseModel',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  baseModel?: string;
  /**
   * @description The module the base model is imported from. Emitted as
   * `from {runtimeImport} import {baseModel}` (with `ConfigDict` / `Field`
   * appended when the generated types use aliases). Defaults to `pydantic`; if
   * you override it, point it at a module that re-exports a pydantic-compatible
   * `BaseModel`, `ConfigDict`, and `Field`.
   * @default "pydantic"
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    generates: {
   *      'schema.py': {
   *        plugins: ['@graphql-codegen/python'],
   *        config: {
   *          runtimeImport: 'pydantic',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  runtimeImport?: string;
  /**
   * @description Controls how GraphQL OBJECT / INTERFACE field names are turned
   * into Python class attributes. Input-type keys are unaffected — they always
   * keep the wire (GraphQL) name because the runtime forwards the input dict to
   * the server as-is.
   *
   * - `'snakeCase'` (default): field names are converted from camelCase to
   *   snake_case and Python reserved keywords are suffixed with `_`. This is the
   *   idiomatic-Python choice; each renamed field is pinned with `Field(alias=...)`
   *   (e.g. `from` -> `from_` with `alias='from'`) so pydantic hydrates the
   *   original wire key onto the attribute.
   * - `'keep'`: object / interface field names are used verbatim; a keyword /
   *   non-identifier field falls back to a trailing `_` for just that field.
   *
   * @default "snakeCase"
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    generates: {
   *      'schema.py': {
   *        plugins: ['@graphql-codegen/python'],
   *        config: {
   *          namingConvention: 'snakeCase',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  namingConvention?: 'keep' | 'snakeCase';
  /**
   * @description Does not add a `__typename` field to the generated types.
   * For the Python types plugin `__typename` is not emitted by default, so this
   * option is accepted for parity but has no additional effect unless you opt in
   * elsewhere.
   * @default true
   */
  skipTypename?: boolean;
}
