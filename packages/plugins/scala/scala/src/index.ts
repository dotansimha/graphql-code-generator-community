import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import { createBasePlugin } from '@graphql-codegen/scala-common';
import { ScalaPluginRawConfig } from './config';
import { ScalaVisitor } from './visitor';

export const plugin: PluginFunction<ScalaPluginRawConfig> = createBasePlugin<
  ScalaPluginRawConfig,
  ScalaVisitor
>((schema, config, info) => new ScalaVisitor(schema, config, info));

export { ScalaPluginRawConfig } from './config';
