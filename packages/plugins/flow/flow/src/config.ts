import { RawTypesConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates Flow types based on your `GraphQLSchema`.
 *
 * It generates types for your entire schema: types, input types, enum, interface, scalar and union.
 */
export interface FlowPluginConfig extends RawTypesConfig {
  /**
   * @description Generates Flow types as Exact types.
   * @default true
   *
   * @exampleMarkdown
   * ```yaml {6}
   * generates:
   *   path/to/file.js:
   *     plugins:
   *       - flow
   *     config:
   *       useFlowExactObjects: false
   * ```
   */
  useFlowExactObjects?: boolean;
  /**
   * @description Generates read-only Flow types
   * @default false
   *
   * @exampleMarkdown
   * ```yaml {6}
   * generates:
   *   path/to/file.js:
   *     plugins:
   *       - flow
   *     config:
   *       useFlowReadOnlyTypes: true
   * ```
   */
  useFlowReadOnlyTypes?: boolean;
}
