import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import { createBasePlugin } from '@graphql-codegen/scala-common';
import { ScalaJsPluginRawConfig } from './config';
import { ScalaJsVisitor } from './visitor';

export const plugin: PluginFunction<ScalaJsPluginRawConfig> = createBasePlugin<
  ScalaJsPluginRawConfig,
  ScalaJsVisitor
>((schema, config, info) => new ScalaJsVisitor(schema, config, info));

export { ScalaJsPluginRawConfig } from './config';
