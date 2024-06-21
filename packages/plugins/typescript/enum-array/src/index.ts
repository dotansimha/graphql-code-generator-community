import { buildSchema, GraphQLEnumType, GraphQLSchema, printSchema } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { convertFactory } from '@graphql-codegen/visitor-plugin-common';
import { EnumArrayPluginConfig } from './config.js';

function getEnumTypeMap(schema: GraphQLSchema): GraphQLEnumType[] {
  const typeMap = schema.getTypeMap();
  const result: GraphQLEnumType[] = [];
  for (const key in typeMap) {
    if (typeMap[key].astNode?.kind === 'EnumTypeDefinition') {
      result.push(typeMap[key] as GraphQLEnumType);
    }
  }
  return result;
}

function buildArrayDefinition(e: GraphQLEnumType, config: EnumArrayPluginConfig): string {
  const convert = convertFactory(config);

  const enumName = convert(e.astNode, {
    prefix: config.enumPrefix ?? true ? config.typesPrefix : undefined,
    suffix: config.typesSuffix,
  });

  const upperName = e.name
    .replace(/[A-Z]/g, letter => `_${letter}`)
    .slice(1)
    .toUpperCase();
  const values = e
    .getValues()
    .map(v => {
      if (config.useMembers) {
        return `${enumName}.${convert(v.astNode, { transformUnderscore: true })}`;
      } else {
        return `'${v.value}'`;
      }
    })
    .join(', ');

  if (config.constArrays) {
    return `export const ${upperName} = [${values}] as const;`;
  } else {
    return `export const ${upperName}: ${enumName}[] = [${values}];`;
  }
}

function buildImportStatement(enums: GraphQLEnumType[], importFrom: string): string[] {
  const names: string[] = Object.values(enums).map(e => e.name);
  return [`import { ${names.join(', ')} } from "${importFrom}";`];
}

export const plugin: PluginFunction<EnumArrayPluginConfig> = (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  config: EnumArrayPluginConfig,
): Types.PluginOutput => {
  // https://github.com/graphql/graphql-js/issues/1575#issuecomment-454978897
  const enums = getEnumTypeMap(buildSchema(printSchema(schema)));
  const content = enums.map(e => buildArrayDefinition(e, config)).join('\n');
  const result: Types.PluginOutput = { content };
  if (config.importFrom) {
    result['prepend'] = buildImportStatement(enums, config.importFrom);
  }
  return result;
};

export default { plugin };
