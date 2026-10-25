import { RawDocumentsConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates Python operation types (per-operation
 * result + variables `TypedDict`s) from your GraphQL documents.
 *
 * It is document-driven (like `@graphql-codegen/typescript-operations`): it
 * walks each `OperationDefinition` against the schema and recursively emits
 * named, nested classes for every object selection set. Operation RESULT types
 * become [pydantic](https://docs.pydantic.dev) `BaseModel` subclasses with
 * snake_case attributes (each renamed key pinned via `Field(alias=...)`), while
 * the `<Operation>Variables` type is a `TypedDict` keyed by the WIRE (GraphQL)
 * variable name (variables are sent to the server as-is).
 * Every annotation is quoted so forward / recursive references resolve without
 * ordering constraints.
 */
export interface PythonOperationsPluginConfig extends RawDocumentsConfig {
  /**
   * @description Controls how GraphQL response keys (field names / aliases) are
   * turned into Python `BaseModel` result-class attributes. Variable keys are
   * unaffected — they always keep the wire (GraphQL) name.
   *
   * - `'snakeCase'` (default): keys are converted from camelCase to snake_case
   *   and Python reserved keywords are suffixed with `_`. Each renamed key is
   *   pinned with `Field(alias=...)` so pydantic hydrates the original wire key
   *   onto the attribute.
   * - `'keep'`: response keys are used verbatim; a keyword / non-identifier key
   *   falls back to a trailing `_` for just that field.
   *
   * @default "snakeCase"
   */
  namingConvention?: 'keep' | 'snakeCase';
  /**
   * @description The base class that generated operation result types extend.
   * @default "BaseModel"
   */
  baseModel?: string;
  /**
   * @description The module the base model is imported from. Emitted as
   * `from {runtimeImport} import {baseModel}` (with `ConfigDict` / `Field`
   * appended when the generated types use aliases). Defaults to `pydantic`.
   * @default "pydantic"
   */
  runtimeImport?: string;
  /**
   * @description Optional module to star-import base schema type names from.
   *
   * Generated field annotations reference base type names (enums, input types)
   * as quoted forward references, e.g. `role: 'Role'`. By default no import for
   * those names is emitted (the plugin assumes the base types live in the same
   * file or are provided elsewhere). If set, the plugin prepends
   * `from {typesImport} import *` so those names resolve at runtime.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    generates: {
   *      'operations.py': {
   *        plugins: ['@graphql-codegen/python-operations'],
   *        config: {
   *          typesImport: 'my_package.schema_types',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  typesImport?: string;
}
