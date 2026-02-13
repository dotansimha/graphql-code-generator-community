import { ClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * Plugin generates typed SolidStart URQL query primitives and actions for GraphQL operations
 */
export interface SolidStartUrqlPluginConfig extends ClientSideBasePluginConfig {
  /**
   * @name withPrimitives
   * @description Whether to generate SolidStart primitives (createQuery for queries, createMutation for mutations as actions, createSubscription for subscriptions)
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
   *       - typescript-solidstart-urql
   *     config:
   *       withPrimitives: false
   * ```
   */
  withPrimitives: boolean;
  /**
   * @name urqlImportFrom
   * @description The package to import URQL functions from
   * @default "@urql/solid-start"
   *
   * @exampleMarkdown
   * ## Use a custom URQL package
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-solidstart-urql
   *     config:
   *       urqlImportFrom: "custom-urql-package"
   * ```
   */
  urqlImportFrom: string;
}
