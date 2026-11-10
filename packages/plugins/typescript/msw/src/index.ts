import { extname } from 'path';
import { concatAST, FragmentDefinitionNode, Kind } from 'graphql';
import { oldVisit, PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { MSWRawPluginConfig } from './config.js';
import { MSWVisitor } from './visitor.js';

export const plugin: PluginFunction<MSWRawPluginConfig, Types.ComplexPluginOutput> = (
  schema,
  documents,
  config,
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
  const visitor = new MSWVisitor(schema, allFragments, config);
  oldVisit(allAst, { leave: visitor });

  return {
    prepend: visitor.getImports(),
    content: visitor.getContent(),
  };
};

export const validate: PluginValidateFn<MSWRawPluginConfig> = async (
  schema,
  documents,
  config,
  { outputFile },
) => {
  if (extname(outputFile) !== '.ts') {
    throw new Error(`Plugin "typescript-msw" requires extension to be ".ts"!`);
  }
};

export { MSWVisitor };
