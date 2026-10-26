import { concatAST, GraphQLSchema, Kind, OperationDefinitionNode } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { PythonOperationsPluginConfig } from './config.js';
import { PythonOperationsVisitor } from './visitor.js';

export * from './config.js';
export * from './visitor.js';
export * from './python-helpers.js';

/**
 * Document-driven plugin: for each GraphQL operation in the provided documents,
 * emit a per-operation result `TypedDict` (with named nested `TypedDict`s for
 * every object selection) plus a `<Operation>Variables` `TypedDict`.
 */
export const plugin: PluginFunction<PythonOperationsPluginConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: PythonOperationsPluginConfig,
) => {
  const allAst = concatAST(documents.map(d => d.document).filter(Boolean) as any);

  const operations = allAst.definitions.filter(
    (def): def is OperationDefinitionNode => def.kind === Kind.OPERATION_DEFINITION,
  );

  const visitor = new PythonOperationsVisitor(schema, config);

  const definitions = operations.map(op => visitor.generateOperation(op));

  return {
    prepend: visitor.getImports(),
    content: definitions.join('\n\n\n'),
  };
};
