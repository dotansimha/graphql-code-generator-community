import { DART_KEYWORDS, DART_SCALARS, FlutterFreezedPluginConfig } from '../src/config';
import { defaultFreezedConfig, defaultFreezedPluginConfig } from '../src/utils';
import { customDecoratorsConfig, typeConfig } from './config';

describe('flutter-freezed-plugin-config', () => {
  it('should return the built-in Dart scalar types', () => {
    expect(DART_SCALARS).toMatchObject({
      ID: 'String',
      String: 'String',
      Boolean: 'bool',
      Int: 'int',
      Float: 'double',
      DateTime: 'DateTime',
    });
  });

  it('checks that all Dart language keywords are accounted for', () => {
    expect(Object.keys(DART_KEYWORDS)).toHaveLength(78);
    expect(Object.values(DART_KEYWORDS).filter((v: string) => v === 'built-in')).toHaveLength(23);
    expect(Object.values(DART_KEYWORDS).filter((v: string) => v === 'context')).toHaveLength(5);
    expect(Object.values(DART_KEYWORDS).filter((v: string) => v === 'async-reserved')).toHaveLength(2);
    expect(Object.values(DART_KEYWORDS).filter((v: string) => v === 'reserved')).toHaveLength(48);
  });

  it('should return the default plugin values', () => {
    const config: FlutterFreezedPluginConfig = defaultFreezedPluginConfig;
    expect(config.camelCasedEnums).toBe(true);
    expect(config.customScalars).toMatchObject({});
    expect(config.fileName).toBe('app_models');
    expect(config.globalFreezedConfig).toMatchObject(defaultFreezedConfig);
    expect(config.ignoreTypes).toMatchObject([]);
    expect(config.typeSpecificFreezedConfig).toMatchObject({});
  });

  it('should return the default globalFreezedConfig values', () => {
    const config: FlutterFreezedPluginConfig = defaultFreezedPluginConfig;
    const globalFreezedConfig = config?.globalFreezedConfig;

    expect(globalFreezedConfig?.alwaysUseJsonKeyName).toBe(false);
    expect(globalFreezedConfig?.copyWith).toBeUndefined();
    expect(globalFreezedConfig?.customDecorators).toMatchObject({});
    expect(globalFreezedConfig?.dartKeywordEscapeCasing).toBeUndefined();
    expect(globalFreezedConfig?.dartKeywordEscapePrefix).toBeUndefined();
    expect(globalFreezedConfig?.dartKeywordEscapeSuffix).toBe('_');
    expect(globalFreezedConfig?.equal).toBeUndefined();
    expect(globalFreezedConfig?.escapeDartKeywords).toBe(true);
    expect(globalFreezedConfig?.fromJsonToJson).toBe(true);
    expect(globalFreezedConfig?.immutable).toBe(true);
    expect(globalFreezedConfig?.makeCollectionsUnmodifiable).toBeUndefined();
    expect(globalFreezedConfig?.mergeInputs).toMatchObject([]);
    expect(globalFreezedConfig?.mutableInputs).toBe(true);
    expect(globalFreezedConfig?.privateEmptyConstructor).toBe(true);
    expect(globalFreezedConfig?.unionKey).toBeUndefined();
    expect(globalFreezedConfig?.unionValueCase).toBeUndefined();
  });

  it('should  return the typeSpecificFreezedConfig values', () => {
    const config = typeConfig;
    const typeName = 'Starship';
    const typeSpecificFreezedConfig = config?.typeSpecificFreezedConfig?.[typeName]?.config;

    expect(config?.typeSpecificFreezedConfig?.[typeName]?.deprecated).toBe(true);
    expect(typeSpecificFreezedConfig?.alwaysUseJsonKeyName).toBe(true);
    expect(typeSpecificFreezedConfig?.copyWith).toBe(false);
    expect(typeSpecificFreezedConfig?.customDecorators).toBeUndefined();
    expect(typeSpecificFreezedConfig?.dartKeywordEscapeCasing).toBeUndefined();
    expect(typeSpecificFreezedConfig?.dartKeywordEscapePrefix).toBeUndefined();
    expect(typeSpecificFreezedConfig?.dartKeywordEscapeSuffix).toBeUndefined();
    expect(typeSpecificFreezedConfig?.equal).toBeUndefined();
    expect(typeSpecificFreezedConfig?.escapeDartKeywords).toBeUndefined();
    expect(typeSpecificFreezedConfig?.fromJsonToJson).toBeUndefined();
    expect(typeSpecificFreezedConfig?.immutable).toBe(false);
    expect(typeSpecificFreezedConfig?.makeCollectionsUnmodifiable).toBeUndefined();
    expect(typeSpecificFreezedConfig?.mergeInputs).toBeUndefined();
    expect(typeSpecificFreezedConfig?.mutableInputs).toBeUndefined();
    expect(typeSpecificFreezedConfig?.privateEmptyConstructor).toBeUndefined();
    expect(typeSpecificFreezedConfig?.unionKey).toBeUndefined();
    expect(typeSpecificFreezedConfig?.unionValueCase).toBe('FreezedUnionCase.pascal');
  });

  it('should  return the values of the field of the Droid Type', () => {
    const config = customDecoratorsConfig;
    const typeName = 'Droid';
    const fieldName = 'id';
    const decorator = '@NanoId';
    const fieldConfig = config?.typeSpecificFreezedConfig?.[typeName]?.fields?.[fieldName];

    expect(fieldConfig?.final).toBeUndefined();
    expect(fieldConfig?.deprecated).toBeUndefined();
    expect(fieldConfig?.defaultValue).toBeUndefined();
    expect(fieldConfig?.customDecorators?.[decorator].applyOn).toMatchObject(['union_factory_parameter']);
    expect(fieldConfig?.customDecorators?.[decorator].arguments).toMatchObject([
      'size: 16',
      'alphabets: NanoId.ALPHA_NUMERIC',
    ]);
    expect(fieldConfig?.customDecorators?.[decorator].mapsToFreezedAs).toBe('custom');
  });
});
