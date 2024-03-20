import { concatAST, type FragmentDefinitionNode, type GraphQLSchema, Kind } from 'graphql';
import {
  oldVisit,
  type PluginFunction,
  type PluginValidateFn,
  type Types,
} from '@graphql-codegen/plugin-helpers';
import type { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import type { RawEffectPluginConfig } from './config.js';
import { EffectVisitor } from './visitor.js';

export const plugin: PluginFunction<RawEffectPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: RawEffectPluginConfig,
) => {
  if (config.mode === 'client-only') return EffectVisitor.clientContent();

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
  config: RawEffectPluginConfig,
  outputFile: string,
) => {
  if (
    config.mode === 'operations-only' &&
    (!config.relativeClientImportPath || config.relativeClientImportPath.length === 0)
  ) {
    throw new Error(
      `Plugin "typescript-effect" requires the "relativeClientImportPath" configuration option to be a non-empty string when "mode" is set to "operations-only"!`,
    );
  }
};
