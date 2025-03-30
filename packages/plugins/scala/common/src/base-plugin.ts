import { GraphQLSchema } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { ScalaBaseVisitor } from './base-visitor';
import { ScalaPluginCommonRawConfig } from './config';

export type BasePluginFunction<TRawConfig extends ScalaPluginCommonRawConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TRawConfig,
  info: { outputFile?: string },
) => Types.PluginOutput;

export const createBasePlugin = <
  TRawConfig extends ScalaPluginCommonRawConfig,
  TVisitor extends ScalaBaseVisitor<TRawConfig, any>,
>(
  createVisitor: (
    schema: GraphQLSchema,
    config: TRawConfig,
    outputFileInfo: { outputFile?: string },
  ) => TVisitor,
): BasePluginFunction<TRawConfig> => {
  return (
    schema: GraphQLSchema,
    _: Types.DocumentFile[],
    config: TRawConfig,
    info: { outputFile?: string },
  ): Types.PluginOutput => {
    if (!config.packageName && info.outputFile) {
      const parts = info.outputFile.split('/');
      parts.pop();

      if (parts.length > 0) {
        config = {
          ...config,
          packageName: parts.join('.'),
        };
      }
    }

    const visitor = createVisitor(schema, config, { outputFile: info.outputFile });
    const typeNames = Object.keys(schema.getTypeMap()).filter(
      typeName => !typeName.startsWith('__'),
    );

    const header = [
      visitor.getPackage(),
      '',
      visitor.getImports(),
      '',
      'getTypeClassDefinitions' in visitor ? (visitor as any).getTypeClassDefinitions() : '',
    ]
      .filter(Boolean)
      .join('\n');

    const schemaScalarTypeNames = typeNames.filter(typeName => {
      const type = schema.getTypeMap()[typeName];
      return type.astNode?.kind === 'ScalarTypeDefinition';
    });

    const customScalarDefinitions: string[] = [];
    if (config.scalars) {
      Object.keys(config.scalars).forEach(scalarName => {
        if (typeof config.scalars[scalarName] === 'string') {
          const scalarType = config.scalars[scalarName];
          customScalarDefinitions.push(`type ${scalarName} = ${scalarType}`);
        }
      });
    }

    const defaultScalars = visitor.generateCustomScalars
      ? visitor.generateCustomScalars([
          ...schemaScalarTypeNames,
          ...Object.keys(config.scalars || {}),
        ])
      : [];

    const contentFragments = typeNames.map(typeName => {
      const type = schema.getTypeMap()[typeName];

      if (
        type.astNode?.kind === 'ScalarTypeDefinition' &&
        config.scalars &&
        typeof config.scalars[typeName] === 'string'
      ) {
        return '';
      }

      const astNodeKind = type.astNode?.kind as string | undefined;
      if (astNodeKind && astNodeKind in visitor) {
        const handler = (visitor as any)[astNodeKind];
        if (typeof handler === 'function') {
          return handler.call(visitor, type.astNode);
        }
      }

      return '';
    });

    const content = [
      header,
      ...customScalarDefinitions,
      ...defaultScalars,
      ...contentFragments.filter(Boolean),
    ].join('\n\n');

    return {
      content,
      prepend: [],
      append: [],
    };
  };
};
