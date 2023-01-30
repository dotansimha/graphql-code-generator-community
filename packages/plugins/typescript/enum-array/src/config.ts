import { RawTypesConfig } from '@graphql-codegen/visitor-plugin-common';

export interface EnumArrayPluginConfig extends RawTypesConfig {
  /**
   * @description import enum types from generated type path
   * if not given, omit import statement.
   */
  importFrom?: string;
  /**
   * @description generate the arrays as const. Defaults to false
   */
  constArrays?: boolean;
  /**
   * @description use enum members instead of string literals. Defaults to false
   */
  useMembers?: boolean;
}
