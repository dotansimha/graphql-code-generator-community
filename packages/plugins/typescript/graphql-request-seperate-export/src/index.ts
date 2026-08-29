import { extname } from 'path';
import { concatAST, FragmentDefinitionNode, GraphQLSchema, Kind } from 'graphql';
import { DocumentNode } from 'graphql';
import { oldVisit, PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import {
  LoadedFragment,
  RawClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { RawGraphQLSeperateExportPluginConfig } from './config';
import { GraphQLRequestSeperateExportVisitor } from './visitor';

export const plugin: PluginFunction<RawGraphQLSeperateExportPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: RawGraphQLSeperateExportPluginConfig,
) => {
  const allAst = concatAST(documents.map(v => v.document));
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
    ...(config.externalFragments || []),
  ];
  const visitor = new GraphQLRequestSeperateExportVisitor(schema, allFragments, config);
  const visitorResult = oldVisit(allAst, { leave: visitor }) as DocumentNode;

  return {
    prepend: visitor.getImports(),
    content: [
      visitor.fragments,
      'type GraphQLClientRequestHeaders = Headers | string[][] | Record<string, string>',
      ...visitorResult.definitions.filter(t => typeof t === 'string'),
      visitor.sdkContent,
    ].join('\n'),
  };
};

export const validate: PluginValidateFn<any> = async (
  _schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  _config: RawClientSideBasePluginConfig,
  outputFile: string,
) => {
  if (extname(outputFile) !== '.ts') {
    throw new Error(
      `Plugin "typescript-graphql-request-seperate-export" requires extension to be ".ts"!`,
    );
  }
};

export { GraphQLRequestSeperateExportVisitor };
