import { EnumValuesMap, RawConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description Common configuration for Scala code generation plugins
 */
export interface ScalaPluginCommonRawConfig extends RawConfig {
  /**
   * @description Customize the Scala package name. The default package name will be generated according to the output file path.
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   src/main/scala/com/example/Types.scala:
   *     plugins:
   *       - scala
   *     config:
   *       packageName: custom.package.name
   * ```
   */
  packageName?: string;

  /**
   * @description Customize the class members prefix. The default is empty.
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   src/main/scala/com/example/Types.scala:
   *     plugins:
   *       - scala
   *     config:
   *       classMembersPrefix: '_'
   * ```
   */
  classMembersPrefix?: string;

  /**
   * @description Overrides the default value of enum values declared in your GraphQL schema.
   *
   * @exampleMarkdown
   * ```yaml
   * config:
   *   enumValues:
   *     MyEnum:
   *       A: 'CustomEnumValue'
   * ```
   */
  enumValues?: EnumValuesMap;

  /**
   * @default true
   * @description Whether to generate companion objects for case classes
   *
   * @exampleMarkdown
   * ```yaml
   * config:
   *   generateCompanionObjects: false
   * ```
   */
  generateCompanionObjects?: boolean;

  /**
   * @default false
   * @description Whether to use Scala Option[T] for nullable fields
   *
   * @exampleMarkdown
   * ```yaml
   * config:
   *   useOptions: true
   * ```
   */
  useOptions?: boolean;

  /**
   * @default Types
   * @description Allow you to customize the class name or object name.
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   src/main/scala/com/example/MyGeneratedTypes.scala:
   *     plugins:
   *       - scala
   *     config:
   *       className: MyGeneratedTypes
   * ```
   */
  className?: string;

  /**
   * @default List
   * @description Allow you to customize the list type
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   src/main/scala/com/example/Types.scala:
   *     plugins:
   *       - scala
   *     config:
   *       listType: Vector
   * ```
   */
  listType?: string;

  /**
   * @default false
   * @description Whether to use opaque types for certain types
   *
   * @exampleMarkdown
   * ```yaml
   * config:
   *   useOpaqueTypes: true
   * ```
   */
  useOpaqueTypes?: boolean;

  /**
   * @default false
   * @description Generates companion objects with helper methods specific to Scala
   *
   * @exampleMarkdown
   * ```yaml
   * config:
   *   generateScalaHelpers: true
   * ```
   */
  generateScalaHelpers?: boolean;
}
