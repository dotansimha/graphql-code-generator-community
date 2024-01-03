import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLType,
  GraphQLWrappingType,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
  isUnionType,
  isWrappingType,
  TypeNode,
} from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { convertFactory, ConvertFn } from '@graphql-codegen/visitor-plugin-common';
import { UrqlGraphCacheConfig } from './config.js';

type GraphQLFlatType = Exclude<TypeNode, GraphQLWrappingType>;

const unwrapType = (type: null | undefined | TypeNode): GraphQLFlatType | null =>
  isWrappingType(type) ? unwrapType(type.ofType as any) : type || null;

const getObjectTypes = (schema: GraphQLSchema): GraphQLObjectType[] => {
  const typeMap = schema.getTypeMap();
  const queryType = schema.getQueryType();
  const mutationType = schema.getMutationType();
  const subscriptionType = schema.getSubscriptionType();

  const objectTypes: GraphQLObjectType[] = [];

  for (const key in typeMap) {
    if (!typeMap[key] || !typeMap[key].name) continue;

    const type = typeMap[key];
    switch (type.name) {
      case '__Directive':
      case '__DirectiveLocation':
      case '__EnumValue':
      case '__InputValue':
      case '__Field':
      case '__Type':
      case '__TypeKind':
      case '__Schema':
        continue;
      default:
        if (!(type instanceof GraphQLObjectType)) continue;
    }

    if (type !== queryType && type !== mutationType && type !== subscriptionType) {
      objectTypes.push(type);
    }
  }

  return objectTypes;
};

function constructType(
  typeNode: GraphQLType,
  schema: GraphQLSchema,
  convertName: ConvertFn,
  config: UrqlGraphCacheConfig,
  nullable = true,
  allowString = false,
): string {
  if (isListType(typeNode)) {
    return nullable
      ? `Maybe<Array<${constructType(
          typeNode.ofType,
          schema,
          convertName,
          config,
          false,
          allowString,
        )}>>`
      : `Array<${constructType(typeNode.ofType, schema, convertName, config, false, allowString)}>`;
  }

  if (isNonNullType(typeNode)) {
    return constructType(typeNode.ofType, schema, convertName, config, false, allowString);
  }

  const type = schema.getType(typeNode.name);
  if (isScalarType(type)) {
    return nullable
      ? `Maybe<Scalars['${type.name}']${allowString ? ' | string' : ''}>`
      : `Scalars['${type.name}']${allowString ? ' | string' : ''}`;
  }

  const tsTypeName = convertName(typeNode.name, {
    prefix: config.typesPrefix,
    suffix: config.typesSuffix,
  });

  if (isUnionType(type) || isInputObjectType(type) || isObjectType(type)) {
    const finalType = `WithTypename<${tsTypeName}>${allowString ? ' | string' : ''}`;
    return nullable ? `Maybe<${finalType}>` : finalType;
  }

  if (isEnumType(type)) {
    const finalType = `${tsTypeName}${allowString ? ' | string' : ''}`;
    return nullable ? `Maybe<${finalType}>` : finalType;
  }

  if (isInterfaceType(type)) {
    const possibleTypes = schema.getPossibleTypes(type).map(possibleType => {
      const tsPossibleTypeName = convertName(possibleType.name, {
        prefix: config.typesPrefix,
        suffix: config.typesSuffix,
      });
      return `WithTypename<${tsPossibleTypeName}>`;
    });
    const finalType = allowString
      ? possibleTypes.join(' | ') + ' | string'
      : possibleTypes.join(' | ');
    return nullable ? `Maybe<${finalType}>` : finalType;
  }

  throw new Error(`Unhandled type ${type}`);
}

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

function getKeysConfig(
  schema: GraphQLSchema,
  convertName: ConvertFn,
  config: UrqlGraphCacheConfig,
) {
  const keys = getObjectTypes(schema).reduce((keys, type) => {
    keys.push(
      `${type.name}?: (data: WithTypename<${convertName(type.name, {
        prefix: config.typesPrefix,
        suffix: config.typesSuffix,
      })}>) => null | string`,
    );
    return keys;
  }, []);

  return 'export type GraphCacheKeysConfig = {\n  ' + keys.join(',\n  ') + '\n}';
}

function getResolversConfig(
  schema: GraphQLSchema,
  convertName: ConvertFn,
  config: UrqlGraphCacheConfig,
) {
  const objectTypes = [schema.getQueryType(), ...getObjectTypes(schema)];

  const resolvers = objectTypes.reduce((resolvers, parentType) => {
    const fields = Object.entries(parentType.getFields()).reduce((fields, [fieldName, field]) => {
      const args = Object.entries(field.args);
      const argsName = args.length
        ? convertName(`${parentType.name}${capitalize(fieldName)}Args`, {
            prefix: config.typesPrefix,
            suffix: config.typesSuffix,
          })
        : 'Record<string, never>';
      fields.push(
        `${fieldName}?: GraphCacheResolver<WithTypename<` +
          `${convertName(parentType.name, {
            prefix: config.typesPrefix,
            suffix: config.typesSuffix,
          })}>, ${argsName}, ` +
          `${constructType(field.type, schema, convertName, config, false, true)}>`,
      );

      return fields;
    }, []);

    resolvers.push(`  ${parentType.name}?: {\n    ` + fields.join(',\n    ') + '\n  }');

    return resolvers;
  }, []);

  return resolvers;
}

function getRootUpdatersConfig(
  schema: GraphQLSchema,
  convertName: ConvertFn,
  config: UrqlGraphCacheConfig,
) {
  const [queryUpdaters, mutationUpdaters, subscriptionUpdaters] = [
    schema.getQueryType(),
    schema.getMutationType(),
    schema.getSubscriptionType(),
  ].map(rootType => {
    if (rootType) {
      const updaters: string[] = [];
      Object.values(rootType.getFields()).forEach(field => {
        const argsName = field.args.length
          ? convertName(`${rootType.name}${capitalize(field.name)}Args`, {
              prefix: config.typesPrefix,
              suffix: config.typesSuffix,
            })
          : 'Record<string, never>';

        updaters.push(
          `${field.name}?: GraphCacheUpdateResolver<{ ${field.name}: ${constructType(
            field.type,
            schema,
            convertName,
            config,
          )} }, ${argsName}>`,
        );
      });

      return updaters;
    }
    return null;
  });

  const typeUpdateResolvers = getObjectTypes(schema).reduce((resolvers, parentType) => {
    const fields = Object.entries(parentType.getFields()).reduce((fields, [fieldName, field]) => {
      const argsName = field.args.length
        ? convertName(`${parentType.name}${capitalize(fieldName)}Args`, {
            prefix: config.typesPrefix,
            suffix: config.typesSuffix,
          })
        : 'Record<string, never>';

      fields.push(
        `${field.name}?: GraphCacheUpdateResolver<${constructType(
          parentType,
          schema,
          convertName,
          config,
        )}, ${argsName}>`,
      );

      return fields;
    }, []);

    resolvers.push(`  ${parentType.name}?: {\n    ` + fields.join(',\n    ') + '\n  }');

    return resolvers;
  }, []);

  return {
    queryUpdaters,
    mutationUpdaters,
    subscriptionUpdaters,
    typeUpdateResolvers,
  };
}

function getOptimisticUpdatersConfig(
  schema: GraphQLSchema,
  convertName: ConvertFn,
  config: UrqlGraphCacheConfig,
): string[] | null {
  const mutationType = schema.getMutationType();
  if (mutationType) {
    const optimistic: string[] = [];

    Object.values(mutationType.getFields()).forEach(field => {
      const argsName = field.args.length
        ? convertName(`${capitalize(mutationType.name)}${capitalize(field.name)}Args`, {
            prefix: config.typesPrefix,
            suffix: config.typesSuffix,
          })
        : 'Record<string, never>';
      const outputType = constructType(field.type, schema, convertName, config);
      optimistic.push(
        `${field.name}?: GraphCacheOptimisticMutationResolver<` +
          `${argsName}, ` +
          `${outputType}>`,
      );
    });

    return optimistic;
  }
  return null;
}

function getImports(config: UrqlGraphCacheConfig): string {
  return [
    `import { ${
      config.offlineExchange ? 'offlineExchange' : 'cacheExchange'
    } } from '@urql/exchange-graphcache';`,
    `${
      config.useTypeImports ? 'import type' : 'import'
    } { Resolver as GraphCacheResolver, UpdateResolver as GraphCacheUpdateResolver, OptimisticMutationResolver as GraphCacheOptimisticMutationResolver } from '@urql/exchange-graphcache';\n`,
  ].join('\n');
}

export const plugin: PluginFunction<UrqlGraphCacheConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  _documents,
  config,
) => {
  const convertName = convertFactory(config);
  const imports = getImports(config);
  const keys = getKeysConfig(schema, convertName, config);
  const resolvers = getResolversConfig(schema, convertName, config);
  const { queryUpdaters, mutationUpdaters, subscriptionUpdaters, typeUpdateResolvers } =
    getRootUpdatersConfig(schema, convertName, config);
  const optimisticUpdaters = getOptimisticUpdatersConfig(schema, convertName, config);

  const queryType = schema.getQueryType();
  const mutationType = schema.getMutationType();
  const subscriptionType = schema.getSubscriptionType();
  return {
    prepend: [imports],
    content: [
      `export type WithTypename<T extends { __typename?: any }> = Partial<T> & { __typename: NonNullable<T['__typename']> };`,

      keys,

      'export type GraphCacheResolvers = {\n' + resolvers.join(',\n') + '\n};',

      'export type GraphCacheOptimisticUpdaters = ' +
        (optimisticUpdaters ? '{\n  ' + optimisticUpdaters.join(',\n  ') + '\n};' : '{};'),

      'export type GraphCacheUpdaters = {\n' +
        `  ${(queryType && queryType.name) || 'Mutation'}?: ` +
        (queryUpdaters ? `{\n    ${queryUpdaters.join(',\n    ')}\n  }` : '{}') +
        ',\n' +
        `  ${(mutationType && mutationType.name) || 'Mutation'}?: ` +
        (mutationUpdaters ? `{\n    ${mutationUpdaters.join(',\n    ')}\n  }` : '{}') +
        ',\n' +
        `  ${(subscriptionType && subscriptionType.name) || 'Subscription'}?: ` +
        (subscriptionUpdaters ? `{\n    ${subscriptionUpdaters.join(',\n    ')}\n  }` : '{}') +
        ',\n' +
        `${typeUpdateResolvers.join(',\n')}` +
        ',\n};',

      `export type GraphCacheConfig = Parameters<typeof ${
        config.offlineExchange ? 'offlineExchange' : 'cacheExchange'
      }>[0] & {\n` +
        '  updates?: GraphCacheUpdaters,\n' +
        '  keys?: GraphCacheKeysConfig,\n' +
        '  optimistic?: GraphCacheOptimisticUpdaters,\n' +
        '  resolvers?: GraphCacheResolvers,\n' +
        '};',
    ]
      .filter(Boolean)
      .join('\n\n'),
  };
};
