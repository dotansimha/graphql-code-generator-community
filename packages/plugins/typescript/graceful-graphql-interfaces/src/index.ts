import { extname } from 'path';
import { concatAST, FragmentDefinitionNode, GraphQLSchema, Kind } from 'graphql';
import { compact } from 'lodash';
import { oldVisit, PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { TypeGuardRawPluginConfig } from './config';
import { GracefulInterfacesVisitor } from './graceful-interfaces-visitor';

export const plugin: PluginFunction = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeGuardRawPluginConfig,
  info: { outputFile: string },
) => {
  const allAst = concatAST(compact(documents.map(v => v.document)));

  const allFragments: LoadedFragment[] = [
    ...(
      allAst.definitions.filter(
        d => d.kind === Kind.FRAGMENT_DEFINITION,
      ) as FragmentDefinitionNode[]
    ).map(fragmentDef => ({
      node: fragmentDef,
      name: fragmentDef.name.value,
      onType: fragmentDef.typeCondition.name.value,
      isExternal: false,
    })),
  ];

  const visitor = new GracefulInterfacesVisitor(
    schema,
    allFragments,
    config,
    documents,
    info.outputFile,
  );
  const visitorResult = oldVisit(allAst, { leave: visitor });

  const parsedResult = [...visitorResult.definitions.filter(t => typeof t === 'string')]
    .join('\n')
    .split(';')
    .filter(t => !t.includes('gql'))
    .join(';');

  if (parsedResult.length === 0) {
    throw new Error(
      'Could not generate any helpers or type guards. Please check your configuration forEntities: ' +
        config.forEntities.join(', '),
    );
  }

  return {
    content: [
      visitor.getSourceFile(),
      visitor.buildTemplates(),
      visitor.getSourceFile().includes(parsedResult) ? '' : parsedResult,
    ].join('\n'),
  };
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeGuardRawPluginConfig,
  outputFile: string,
) => {
  if (extname(outputFile) !== '.tsx') {
    throw new Error(`Plugin "graceful-graphql-interfaces" requires extension to be ".tsx"!`);
  }
};

export { GracefulInterfacesVisitor };
