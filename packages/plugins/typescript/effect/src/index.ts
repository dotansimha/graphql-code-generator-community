import { concatAST, type FragmentDefinitionNode, type GraphQLSchema, Kind } from 'graphql';
import {
  oldVisit,
  type PluginFunction,
  type PluginValidateFn,
  type Types,
} from '@graphql-codegen/plugin-helpers';
import {
  type LoadedFragment,
  type RawClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { EffectVisitor } from './visitor.js';

export const plugin: PluginFunction<{}> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: RawClientSideBasePluginConfig,
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
  const visitor = new EffectVisitor(schema, allFragments, config);
  const visitorResult = oldVisit(allAst, { leave: visitor });

  return {
    prepend: visitor.getImports(),
    content: [
      visitor.fragments,
      ...visitorResult.definitions.filter(t => typeof t === 'string'),
      visitor.sdkContent,
    ].join('\n'),
  };
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: RawClientSideBasePluginConfig,
  outputFile: string,
) => {};
