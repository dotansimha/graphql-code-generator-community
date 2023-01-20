export interface EnumArrayPluginConfig {
  /**
   * @description import enum types from generated type path
   * if not given, omit import statement.
   */
  importFrom?: string;
  /**
   * @description generate the arrays as const. Defaults to false
   */
  constArrays?: boolean;
}
