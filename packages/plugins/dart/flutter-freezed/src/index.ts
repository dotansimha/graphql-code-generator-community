import { oldVisit, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { GraphQLSchema } from 'graphql';
import { FlutterFreezedPluginConfig } from './config';
import { schemaVisitor } from './schema-visitor';
import { buildImportStatements, defaultFreezedPluginConfig } from './utils';

export const plugin: PluginFunction<FlutterFreezedPluginConfig> = (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  _config: FlutterFreezedPluginConfig
): string => {
  // sets the defaults for the config
  const config = { ...defaultFreezedPluginConfig, ..._config };

  const { schema: _schema, ast } = transformSchemaAST(schema, config);
  const { nodeRepository, ...visitor } = schemaVisitor(_schema, config);

  const visitorResult = oldVisit(ast, { leave: visitor });

  const generated: string[] = visitorResult.definitions.filter((def: any) => typeof def === 'string' && def.length > 0);

  return (
    buildImportStatements(config.fileName) +
    generated // TODO: replace placeholders with factory blocks
      /*       .map(freezedDeclarationBlock =>
        freezedDeclarationBlock.toString().replace(/==>factory==>.+\n/gm, s => {
          const pattern = s.replace('==>factory==>', '').trim();
          // console.log('pattern:-->', pattern);
          const [key, appliesOn, name, typeName] = pattern.split('==>');
          if (appliesOn === 'class_factory') {
            return freezedFactoryBlockRepository.retrieve(key, appliesOn, name);
          }
          return freezedFactoryBlockRepository.retrieve(key, appliesOn, name, typeName);
        })
      ) */
      .join('')
      .trim()
  );
};
