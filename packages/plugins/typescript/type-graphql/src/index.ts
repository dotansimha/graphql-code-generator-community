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
import { TypeGraphQLPluginConfig } from './config.js';
import { TypeGraphQLVisitor } from './visitor.js';

export * from './visitor.js';

const TYPE_GRAPHQL_IMPORT = `import * as TypeGraphQL from 'type-graphql';\nexport { TypeGraphQL };`;
const NESTJS_GRAPHQL_IMPORT = `import * as NestJSGraphQL from '@nestjs/graphql';\nexport { NestJSGraphQL };`;

const isDefinitionInterface = (
  definition: string,
  { useNestJSGraphQL }: TypeGraphQLPluginConfig = {},
) =>
  useNestJSGraphQL
    ? definition.includes('@NestJSGraphQL.InterfaceType()')
    : definition.includes('@TypeGraphQL.InterfaceType()');

export const plugin: PluginFunction<TypeGraphQLPluginConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeGraphQLPluginConfig,
) => {
  const visitor = new TypeGraphQLVisitor(schema, config);
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
    prepend: [
      ...visitor.getEnumsImports(),
      ...visitor.getWrapperDefinitions(),
      config.useNestJSGraphQL ? NESTJS_GRAPHQL_IMPORT : TYPE_GRAPHQL_IMPORT,
    ],
    content: [scalars, ...definitions, ...introspectionDefinitions].join('\n'),
  };
};

export { TsIntrospectionVisitor };
