import { GraphQLSchema } from 'graphql';
import {
  getCachedDocumentNodeFromSchema,
  oldVisit,
  PluginFunction,
  Types,
} from '@graphql-codegen/plugin-helpers';
import {
  includeIntrospectionTypesDefinitions,
  TsIntrospectionVisitor,
} from '@graphql-codegen/typescript';
import { NestPluginConfig } from './config.js';
import { NEST_IMPORT } from './constants.js';
import { isDefinitionInterface } from './utils.js';
import { NestVisitor } from './visitor.js';

export const plugin: PluginFunction<Partial<NestPluginConfig>, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: NestPluginConfig,
) => {
  const visitor = new NestVisitor(schema, config);
  const astNode = getCachedDocumentNodeFromSchema(schema);
  const visitorResult = oldVisit(astNode, { leave: visitor });
  const introspectionDefinitions = includeIntrospectionTypesDefinitions(schema, documents, config);
  const scalars = visitor.scalarsDefinition;

  const { definitions } = visitorResult;
  // Sort output by interfaces first, classes last to prevent TypeScript errors
  definitions.sort(
    (definition1, definition2) =>
      +isDefinitionInterface(definition2) - +isDefinitionInterface(definition1),
  );

  return {
    prepend: [...visitor.getEnumsImports(), ...visitor.getWrapperDefinitions(), NEST_IMPORT],
    content: [scalars, ...definitions, ...introspectionDefinitions].join('\n'),
  };
};

export { TsIntrospectionVisitor };
