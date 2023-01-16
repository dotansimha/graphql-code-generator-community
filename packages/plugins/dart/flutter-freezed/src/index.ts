import { oldVisit, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { GraphQLSchema } from 'graphql';
import { defaultFreezedPluginConfig, FlutterFreezedPluginConfig } from './config/plugin-config';
import { Block } from './freezed-declaration-blocks';
import { schemaVisitor } from './schema-visitor';

export const plugin: PluginFunction<FlutterFreezedPluginConfig> = (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  _config: FlutterFreezedPluginConfig,
  info
): string => {
  // sets the defaults for the config
  const config = { ...defaultFreezedPluginConfig, ..._config };

  const { schema: _schema, ast } = transformSchemaAST(schema, config);
  const { nodeRepository, ...visitor } = schemaVisitor(_schema, config);

  const visitorResult = oldVisit(ast, { leave: visitor });

  const importStatements = Block.buildImportStatements(info?.outputFile ?? 'app_models');

  const generatedBlocks: string[] = visitorResult.definitions.filter(
    (def: any) => typeof def === 'string' && def.length > 0
  );
  // return [importStatements, ...generatedBlocks].join('').trim();

  const output = Block.replaceTokens(config, nodeRepository, generatedBlocks);

  return [importStatements, output].join('').trim();
};
