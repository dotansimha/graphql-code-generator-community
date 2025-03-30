import { ScalaPluginCommonRawConfig } from '@graphql-codegen/scala-common';

/**
 * @description This plugin generates Scala code (Scala 3 only) based on your GraphQL schema, including case classes and traits.
 */
export interface ScalaPluginRawConfig extends ScalaPluginCommonRawConfig {
  /**
   * @default none
   * @description Selects the JSON library to use and adds appropriate encoders/decoders
   * Supported values: 'none', 'circe', 'zio-json', 'play-json'
   *
   * @exampleMarkdown
   * ```yaml
   * config:
   *   jsonLibrary: 'circe'
   * ```
   */
  jsonLibrary?: 'none' | 'circe' | 'zio-json' | 'play-json';
}
