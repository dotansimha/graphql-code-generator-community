import { extname } from 'path';
import { concatAST, FragmentDefinitionNode, GraphQLSchema, Kind } from 'graphql';
import { gql } from 'graphql-tag';
import {
  getCachedDocumentNodeFromSchema,
  oldVisit,
  PluginFunction,
  PluginValidateFn,
  Types,
} from '@graphql-codegen/plugin-helpers';
import { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { CSharpOperationsRawPluginConfig } from './config.js';
import { CSharpOperationsVisitor } from './visitor.js';

export const plugin: PluginFunction<CSharpOperationsRawPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config,
) => {
  const schemaAST = getCachedDocumentNodeFromSchema(schema);
  const allAst = concatAST(documents.map(v => v.document).concat(schemaAST));
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

  const visitor = new CSharpOperationsVisitor(schema, allFragments, config, documents);
  const visitorResult = oldVisit(allAst, { leave: visitor });
  const imports = visitor.getCSharpImports();
  const openNameSpace = `namespace ${visitor.config.namespaceName} {`;
  return {
    prepend: [],
    content: [
      imports,
      openNameSpace,
      ...visitorResult.definitions.filter(t => typeof t === 'string'),
      '}',
    ]
      .filter(a => a)
      .join('\n'),
  };
};

export const addToSchema = gql`
  directive @namedClient(name: String!) on OBJECT | FIELD
`;

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config,
  outputFile: string,
) => {
  if (extname(outputFile) !== '.cs') {
    throw new Error(`Plugin "c-sharp-operations" requires extension to be ".cs"!`);
  }
};

export { CSharpOperationsVisitor };
