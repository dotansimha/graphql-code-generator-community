import { ClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * Generates typed Solid URQL hooks for GraphQL operations
 */
export interface SolidUrqlPluginConfig extends ClientSideBasePluginConfig {
  /**
   * @name withPrimitives
   * @description Whether to generate SolidJS primitives (createQuery, createMutation, createSubscription)
   * @default true
   *
   * @exampleMarkdown
   * ## Disable primitives generation
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-solid-urql
   *     config:
   *       withPrimitives: false
   * ```
   */
  withPrimitives: boolean;
  /**
   * @name urqlImportFrom
   * @description The package to import URQL functions from
   * @default "solid-urql"
   *
   * @exampleMarkdown
   * ## Use a custom URQL package
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-solid-urql
   *     config:
   *       urqlImportFrom: "@urql/solid"
   * ```
   */
  urqlImportFrom: string;
}
