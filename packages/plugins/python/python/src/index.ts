import { GraphQLSchema } from 'graphql';
import {
  getCachedDocumentNodeFromSchema,
  oldVisit,
  PluginFunction,
  Types,
} from '@graphql-codegen/plugin-helpers';
import { PythonPluginConfig } from './config.js';
import { PythonVisitor } from './visitor.js';

export * from './config.js';
export * from './visitor.js';

export const plugin: PluginFunction<PythonPluginConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  config: PythonPluginConfig,
) => {
  const astNode = getCachedDocumentNodeFromSchema(schema);
  const visitor = new PythonVisitor(schema, config);

  const visitorResult = oldVisit(astNode, { leave: visitor });

  const content = (visitorResult.definitions as unknown[])
    .filter((def): def is string => typeof def === 'string' && def.length > 0)
    .join('\n\n\n');

  return {
    prepend: visitor.getImports(content),
    content,
  };
};
