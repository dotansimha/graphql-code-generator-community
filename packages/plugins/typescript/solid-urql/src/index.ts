import { concatAST, GraphQLSchema, Kind } from 'graphql';
import { oldVisit, PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { SolidUrqlPluginRawConfig, SolidUrqlVisitor } from './visitor';

export const plugin: PluginFunction<SolidUrqlPluginRawConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: SolidUrqlPluginRawConfig,
) => {
  const allAst = concatAST(documents.map(v => v.document!));
  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as any),
  ];

  const visitor = new SolidUrqlVisitor(schema, allFragments, config, documents);
  const visitorResult = oldVisit(allAst, { leave: visitor as any });

  return {
    prepend: visitor.getImports(),
    content: [
      visitor.fragments,
      ...visitorResult.definitions.filter((definition: any) => typeof definition === 'string'),
    ].join('\n'),
  };
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: SolidUrqlPluginRawConfig,
  outputFile: string,
  allPlugins: Types.ConfiguredPlugin[],
) => {
  if (!outputFile.endsWith('.ts') && !outputFile.endsWith('.tsx')) {
    throw new Error(`Plugin "typescript-solid-urql" requires extension to be ".ts" or ".tsx"!`);
  }
};

export { SolidUrqlVisitor, SolidUrqlPluginRawConfig };
