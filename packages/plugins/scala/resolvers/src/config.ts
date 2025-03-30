import { ScalaPluginCommonRawConfig } from '@graphql-codegen/scala-common';

/**
 * @description This plugin generates Scala Sangria resolver files.
 */
export interface ScalaResolversPluginRawConfig extends ScalaPluginCommonRawConfig {
  /**
   * @description The package name to use in the generated files.
   * @default - Derived from the output file path
   */
  packageName?: string;

  /**
   * @description The class name to use for the main class.
   * @default 'Types'
   */
  className?: string;

  /**
   * @description Use Scala Future types as wrapper for resolver results
   * @default false
   */
  withFuture?: boolean;

  /**
   * @description Use Scala ZIO types as wrapper for resolver results
   * @default false
   */
  withZIO?: boolean;

  /**
   * @description Prefix for class member names
   * @default ''
   */
  classMembersPrefix?: string;

  /**
   * @description Type to use for GraphQL lists
   * @default 'List'
   */
  listType?: string;

  /**
   * @description Use Option for nullable fields
   * @default false
   */
  useOptions?: boolean;

  /**
   * @description Package name for model classes
   * @default - Same as packageName
   */
  modelPackage?: string;
}

export interface ScalaResolversPluginParsedConfig {
  className: string;
  withFuture: boolean;
  withZIO: boolean;
  classMembersPrefix: string;
  listType: string;
  useOptions: boolean;
  package?: string;  // To support legacy code
  modelPackage?: string;
}
