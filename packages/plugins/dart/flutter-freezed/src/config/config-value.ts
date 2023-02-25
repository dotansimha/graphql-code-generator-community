import { appliesOnBlock } from '../utils.js';
import { FieldName, Pattern, TypeName, TypeNamePattern } from './pattern.js';
import {
  APPLIES_ON_ALL_BLOCKS,
  AppliesOn,
  AppliesOnFactory,
  AppliesOnParameters,
  DART_SCALARS,
  defaultFreezedPluginConfig,
  FlutterFreezedPluginConfig,
} from './plugin-config.js';

export class Config {
  static camelCasedEnums = (config: FlutterFreezedPluginConfig) => {
    const _camelCasedEnums = config.camelCasedEnums;

    if (_camelCasedEnums === true) {
      return 'camelCase';
    } else if (_camelCasedEnums === false) {
      return undefined;
    }
    return _camelCasedEnums;
  };

  static copyWith = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return Config.enableWithBooleanOrTypeFieldName(config.copyWith, typeName);
  };

  static customScalars = (config: FlutterFreezedPluginConfig, graphqlScalar: string): string => {
    return config.customScalars?.[graphqlScalar] ?? DART_SCALARS[graphqlScalar] ?? graphqlScalar;
  };

  static defaultValues = (
    config: FlutterFreezedPluginConfig,
    blockAppliesOn: readonly AppliesOnParameters[],
    typeName: TypeName,
    fieldName: FieldName,
  ) => {
    const decorator = (defaultValue: string) => (defaultValue ? `@Default(${defaultValue})\n` : '');

    const defaultValue = config.defaultValues
      ?.filter(
        ([pattern, , configAppliesOn]) =>
          Pattern.findLastConfiguration(pattern, typeName, fieldName) &&
          appliesOnBlock(configAppliesOn, blockAppliesOn),
      )
      ?.slice(-1)?.[0]?.[1];

    return decorator(defaultValue);
  };

  static deprecated = (
    config: FlutterFreezedPluginConfig,
    blockAppliesOn: readonly (AppliesOnFactory | AppliesOnParameters)[],
    typeName: TypeName,
    fieldName?: FieldName,
  ) => {
    const isDeprecated =
      config.deprecated
        ?.filter(
          ([pattern, configAppliesOn]) =>
            Pattern.findLastConfiguration(pattern, typeName, fieldName) &&
            appliesOnBlock(configAppliesOn, blockAppliesOn),
        )
        ?.slice(-1)?.[0] !== undefined;
    return isDeprecated ? '@deprecated\n' : '';
  };

  static equal = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return Config.enableWithBooleanOrTypeFieldName(config.equal, typeName);
  };

  static escapeDartKeywords = (
    config: FlutterFreezedPluginConfig,
    blockAppliesOn: readonly AppliesOn[],
    typeName?: TypeName,
    fieldName?: FieldName,
  ): [prefix?: string, suffix?: string] => {
    const escapeDartKeywords = config.escapeDartKeywords;

    if (escapeDartKeywords === true) {
      return ['', '_']; // use a suffix `_`
    } else if (typeName && Array.isArray(escapeDartKeywords) && escapeDartKeywords.length > 0) {
      const [, prefix, suffix] = escapeDartKeywords
        .filter(
          ([pattern, , , configAppliesOn]) =>
            Pattern.findLastConfiguration(pattern, typeName, fieldName) &&
            appliesOnBlock(configAppliesOn ?? [...APPLIES_ON_ALL_BLOCKS], blockAppliesOn),
        )
        .slice(-1)[0];
      return [prefix, suffix];
    }
    return ['', '']; // no suffix
  };

  static final = (
    config: FlutterFreezedPluginConfig,
    blockAppliesOn: readonly AppliesOnParameters[],
    typeName: TypeName,
    fieldName: FieldName,
  ): boolean => {
    return (
      config.final
        ?.filter(
          ([pattern, configAppliesOn]) =>
            Pattern.findLastConfiguration(pattern, typeName, fieldName) &&
            appliesOnBlock(configAppliesOn, blockAppliesOn),
        )
        ?.slice(-1)?.[0] !== undefined
    );
  };

  /*  static fromJsonToJson = ( // TODO: @next-version
    config: FlutterFreezedPluginConfig,
    blockAppliesOn?: readonly AppliesOnParameters[],
    typeName?: TypeName,
    fieldName?: FieldName
  ) => {
    const fromJsonToJson = config.fromJsonToJson;

    if (typeName && fieldName && Array.isArray(fromJsonToJson)) {
      const [, classOrFunctionName, useClassConverter] = (fromJsonToJson ?? [])
        ?.filter(
          ([pattern, , , appliesOn]) =>
            Pattern.findLastConfiguration(pattern, typeName, fieldName) && appliesOnBlock(appliesOn, blockAppliesOn)
        )
        ?.slice(-1)?.[0];
      return [classOrFunctionName, useClassConverter] as [classOrFunctionName: string, useClassConverter?: boolean];
    } else if (typeName && fromJsonToJson instanceof TypeNamePattern) {
      return Pattern.findLastConfiguration(fromJsonToJson, typeName);
    }

    return fromJsonToJson as boolean;
  };
 */
  static ignoreTypes = (config: FlutterFreezedPluginConfig, typeName: TypeName): string[] => {
    const ignoreTypes = config.ignoreTypes;
    if (ignoreTypes) {
      const isIgnored = Pattern.findLastConfiguration(ignoreTypes, typeName);
      return isIgnored ? [typeName.value] : [];
    }
    return [];
  };

  static immutable = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return Config.enableWithBooleanOrTypeFieldName(config.immutable, typeName);
  };

  static makeCollectionsUnmodifiable = (
    config: FlutterFreezedPluginConfig,
    typeName?: TypeName,
  ) => {
    return Config.enableWithBooleanOrTypeFieldName(config.makeCollectionsUnmodifiable, typeName);
  };

  static mergeTypes = (config: FlutterFreezedPluginConfig, typeName: TypeName) => {
    return config.mergeTypes?.[typeName.value] ?? [];
  };

  static mutableInputs = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return Config.enableWithBooleanOrTypeFieldName(config.mutableInputs, typeName);
  };

  static privateEmptyConstructor = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return Config.enableWithBooleanOrTypeFieldName(config.privateEmptyConstructor, typeName);
  };

  static unionClass =
    (/* config: FlutterFreezedPluginConfig, index: number, unionTypeName: TypeName */) => {
      // const unionClass = config['unionClass'];

      return undefined;
    };

  static unionKey = (/* config: FlutterFreezedPluginConfig, typeName: TypeName */):
    | string
    | undefined => {
    return undefined;
  };

  static unionValueCase = (/* config: FlutterFreezedPluginConfig, typeName: TypeName */):
    | string
    | undefined => {
    return undefined;
  };

  static unionValueFactoryDecorator = () =>
    /*  config: FlutterFreezedPluginConfig,
    unionTypeName: TypeName,
    unionValueTypeName: TypeName */
    {
      return undefined;
    };

  static enableWithBooleanOrTypeFieldName = (
    value?: boolean | TypeNamePattern,
    typeName?: TypeName,
  ) => {
    if (typeof value === 'boolean') {
      return value;
    } else if (value !== undefined && typeName !== undefined) {
      return Pattern.findLastConfiguration(value, typeName);
    }
    return undefined;
  };

  public static create = (
    ...config: Partial<FlutterFreezedPluginConfig>[]
  ): FlutterFreezedPluginConfig => {
    return Object.assign({}, defaultFreezedPluginConfig, ...config);
  };
}
