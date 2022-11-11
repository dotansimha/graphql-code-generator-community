import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { indent } from '@graphql-codegen/visitor-plugin-common';
import { DartIdentifierCasing, FlutterFreezedPluginConfig } from '../src/config';
import { FreezedFactoryBlock } from '../src/freezed-declaration-blocks';
import {
  buildBlock,
  buildBlockName,
  buildClassFooter,
  buildClassHeader,
  buildEnumFooter,
  buildEnumHeader,
  buildImportStatements,
  dartCasing,
  defaultFreezedConfig,
  defaultFreezedPluginConfig,
  escapeDartKeyword,
  getFreezedConfigValue,
  mergeConfig,
  nodeIsObjectType,
  NodeRepository,
  NodeType,
} from '../src/utils';
import { customDecoratorsConfig, fullDemoConfig, typeConfig } from './config';
import { starWarsSchema } from './schema';

const {
  ast: { definitions: astNodesList },
} = transformSchemaAST(starWarsSchema, fullDemoConfig);

const prefixConfig = mergeConfig({
  globalFreezedConfig: { dartKeywordEscapePrefix: 'k_', dartKeywordEscapeSuffix: undefined },
});

const suffixConfig = mergeConfig({
  globalFreezedConfig: { dartKeywordEscapePrefix: undefined, dartKeywordEscapeSuffix: '_k' },
});

const prefixSuffixConfig = mergeConfig({
  globalFreezedConfig: { dartKeywordEscapePrefix: 'k_', dartKeywordEscapeSuffix: '_k' },
});

describe('flutter-freezed-plugin-utils', () => {
  describe('default values for plugin config', () => {
    test('property: defaultFreezedConfig ==> has the default values', () => {
      expect(defaultFreezedConfig).toMatchObject({
        alwaysUseJsonKeyName: false,
        copyWith: undefined,
        customDecorators: {},
        dartKeywordEscapeCasing: undefined,
        dartKeywordEscapePrefix: undefined,
        dartKeywordEscapeSuffix: '_',
        escapeDartKeywords: true,
        equal: undefined,
        fromJsonToJson: true,
        immutable: true,
        makeCollectionsUnmodifiable: undefined,
        mergeInputs: [],
        mutableInputs: true,
        privateEmptyConstructor: true,
        unionKey: undefined,
        unionValueCase: undefined,
      });
    });

    test('property: defaultFreezedPluginConfig ==> has the default values', () => {
      expect(defaultFreezedPluginConfig).toMatchObject({
        camelCasedEnums: true,
        customScalars: {},
        fileName: 'app_models',
        globalFreezedConfig: { ...defaultFreezedConfig },
        typeSpecificFreezedConfig: {},
        ignoreTypes: [],
      });
    });

    test('method: mergeConfig() ==> extends the default config', () => {
      expect(mergeConfig()).toMatchObject(defaultFreezedPluginConfig);
      expect(mergeConfig().globalFreezedConfig).toMatchObject(defaultFreezedConfig);
      expect(mergeConfig().typeSpecificFreezedConfig).toMatchObject({});
      expect(mergeConfig(typeConfig)).toMatchObject(typeConfig);
      expect(mergeConfig().fileName).toBe(fullDemoConfig.fileName);

      const expected: FlutterFreezedPluginConfig = {
        camelCasedEnums: true,
        customScalars: {},
        fileName: 'app_models',
        globalFreezedConfig: {
          ...defaultFreezedConfig,
          customDecorators: {
            '@JsonSerializable(explicitToJson: true)': {
              applyOn: ['class'],
              mapsToFreezedAs: 'custom',
            },
          },
        },
        ignoreTypes: [],
        typeSpecificFreezedConfig: {
          Droid: {
            config: {
              customDecorators: {
                '@FreezedUnionValue': {
                  applyOn: ['union_factory'],
                  arguments: ["'BestDroid'"],
                  mapsToFreezedAs: 'custom',
                },
              },
            },
            fields: {
              id: {
                customDecorators: {
                  '@NanoId': {
                    applyOn: ['union_factory_parameter'],
                    arguments: ['size: 16', 'alphabets: NanoId.ALPHA_NUMERIC'],
                    mapsToFreezedAs: 'custom',
                  },
                },
              },
            },
          },
        },
      };

      expect(customDecoratorsConfig).toMatchObject(expected);
    });
  });

  test('method: nodeIsObjectType() => returns true if node is an ObjectType', () => {
    const expected = [false, true, true, true, true, true, true, false, true, true, true, false];
    expect(astNodesList.map(nodeIsObjectType)).toEqual(expected);
  });

  describe('method: getFreezedConfigValue() ==> ', () => {
    const config = typeConfig;
    const typeName = 'Starship';

    test('without a typeName, returns the value from the globalFreezedConfig(target)', () => {
      expect(getFreezedConfigValue('alwaysUseJsonKeyName', config)).toBe(false);
      expect(getFreezedConfigValue('copyWith', config)).toBeUndefined();
      expect(getFreezedConfigValue('customDecorators', config)).toMatchObject({});
      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config)).toBeUndefined();
      expect(getFreezedConfigValue('dartKeywordEscapePrefix', config)).toBeUndefined();
      expect(getFreezedConfigValue('dartKeywordEscapeSuffix', config)).toBe('_');
      expect(getFreezedConfigValue('equal', config)).toBeUndefined();
      expect(getFreezedConfigValue('escapeDartKeywords', config)).toBe(true);
      expect(getFreezedConfigValue('fromJsonToJson', config)).toBe(true);
      expect(getFreezedConfigValue('immutable', config)).toBe(true);
      expect(getFreezedConfigValue('makeCollectionsUnmodifiable', config)).toBeUndefined();
      expect(getFreezedConfigValue('mergeInputs', config)).toMatchObject([]);
      expect(getFreezedConfigValue('mutableInputs', config)).toBe(true);
      expect(getFreezedConfigValue('privateEmptyConstructor', config)).toBe(true);
      expect(getFreezedConfigValue('unionKey', config)).toBeUndefined();
      expect(getFreezedConfigValue('unionValueCase', config)).toBe('FreezedUnionCase.camel');
    });

    test('without a typeName, will use the defaultValue if the globalFreezedConfig(target) values is undefined', () => {
      expect(getFreezedConfigValue('copyWith', config, undefined, true)).toBe(true);
      expect(getFreezedConfigValue('copyWith', config, undefined, false)).toBe(false);

      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config, undefined, 'snake_case')).toBe('snake_case');
      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config, undefined, 'camelCase')).toBe('camelCase');
      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config, undefined, 'PascalCase')).toBe('PascalCase');

      expect(getFreezedConfigValue('dartKeywordEscapePrefix', config, undefined, 'GQL_')).toBe('GQL_');
      expect(getFreezedConfigValue('dartKeywordEscapePrefix', config, undefined, 'ff')).toBe('ff');

      expect(getFreezedConfigValue('equal', config, undefined, true)).toBe(true);
      expect(getFreezedConfigValue('equal', config, undefined, false)).toBe(false);

      expect(getFreezedConfigValue('makeCollectionsUnmodifiable', config, undefined, true)).toBe(true);
      expect(getFreezedConfigValue('makeCollectionsUnmodifiable', config, undefined, false)).toBe(false);

      expect(getFreezedConfigValue('unionKey', config, undefined, 'runtimeType')).toBe('runtimeType');
      expect(getFreezedConfigValue('unionKey', config, undefined, 'type')).toBe('type');
    });

    test('given a typeName, returns the value from the typeSpecificFreezedConfig(target)', () => {
      expect(getFreezedConfigValue('alwaysUseJsonKeyName', config, typeName)).toBe(true);
      expect(getFreezedConfigValue('copyWith', config, typeName)).toBe(false);
      expect(getFreezedConfigValue('immutable', config, typeName)).toBe(false);
      expect(getFreezedConfigValue('unionValueCase', config, typeName)).toBe('FreezedUnionCase.pascal');
    });

    test('given a typeName, falls back to the globalFreezedConfig if they value is undefined', () => {
      expect(getFreezedConfigValue('customDecorators', config, typeName)).toMatchObject({});
      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config, typeName)).toBeUndefined();
      expect(getFreezedConfigValue('dartKeywordEscapePrefix', config, typeName)).toBeUndefined();
      expect(getFreezedConfigValue('dartKeywordEscapeSuffix', config, typeName)).toBe('_');
      expect(getFreezedConfigValue('equal', config, typeName)).toBeUndefined();
      expect(getFreezedConfigValue('escapeDartKeywords', config, typeName)).toBe(true);
      expect(getFreezedConfigValue('fromJsonToJson', config, typeName)).toBe(true);
      expect(getFreezedConfigValue('makeCollectionsUnmodifiable', config, typeName)).toBeUndefined();
      expect(getFreezedConfigValue('mergeInputs', config, typeName)).toMatchObject([]);
      expect(getFreezedConfigValue('mutableInputs', config, typeName)).toBe(true);
      expect(getFreezedConfigValue('privateEmptyConstructor', config, typeName)).toBe(true);
      expect(getFreezedConfigValue('unionKey', config, typeName)).toBeUndefined();
    });

    test('given a typeName, will use the defaultValue if both typeSpecificFreezedConfig(target) and globalFreezedConfig(fallback) values is undefined', () => {
      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config, typeName, 'snake_case')).toBe('snake_case');
      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config, typeName, 'camelCase')).toBe('camelCase');
      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config, typeName, 'PascalCase')).toBe('PascalCase');

      expect(getFreezedConfigValue('dartKeywordEscapePrefix', config, typeName, 'GQL_')).toBe('GQL_');
      expect(getFreezedConfigValue('dartKeywordEscapePrefix', config, typeName, 'ff')).toBe('ff');

      expect(getFreezedConfigValue('equal', config, typeName, true)).toBe(true);
      expect(getFreezedConfigValue('equal', config, typeName, false)).toBe(false);

      expect(getFreezedConfigValue('makeCollectionsUnmodifiable', config, typeName, true)).toBe(true);
      expect(getFreezedConfigValue('makeCollectionsUnmodifiable', config, typeName, false)).toBe(false);

      expect(getFreezedConfigValue('unionKey', config, typeName, 'runtimeType')).toBe('runtimeType');
      expect(getFreezedConfigValue('unionKey', config, typeName, 'type')).toBe('type');
    });
  });

  test('method: buildImportStatements() => returns a string of import statements', () => {
    expect(buildImportStatements('SomeFileName')).toContain('some_file_name');
    expect(buildImportStatements('_Some-File_Name')).toContain('some_file_name');
    expect(buildImportStatements('Some file name')).toContain('some_file_name');
    expect(buildImportStatements('some-file-name.dart')).toContain('some_file_name.freezed.dart');
    expect(() => buildImportStatements('')).toThrow('fileName is required and must not be empty');

    expect(buildImportStatements('/lib/models/some-file_name.dart')).toBe(
      [
        `import 'package:freezed_annotation/freezed_annotation.dart';\n`,
        `import 'package:flutter/foundation.dart';\n\n`,
        `part 'some_file_name.freezed.dart';\n`,
        `part 'some_file_name.g.dart';\n\n`,
      ].join('')
    );
  });

  test('method: dartCasing() => ', () => {
    expect(dartCasing('snake---- Case___ ME', 'snake_case')).toBe('snake_case_me');
    expect(dartCasing('Camel_ case- -- - ME', 'camelCase')).toBe('camelCaseMe');
    expect(dartCasing('pascal-- --case _ ME', 'PascalCase')).toBe('PascalCaseMe');
    expect(dartCasing('lE-AvE mE A-l_o_n-e')).toBe('lE-AvE mE A-l_o_n-e');
  });

  describe('methods: escapeDartKey() and buildBlockName() => ', () => {
    const config = mergeConfig();

    type T = {
      title: string;
      args: {
        config: FlutterFreezedPluginConfig;
        blockName: string;
        typeName?: string;
        expected: string;
        casing?: DartIdentifierCasing;
        decorateWithAtJsonKey?: boolean;
      }[];
    }[];

    const data: T = [
      {
        title: 'defaultConfig => NOT a valid Dart Language Keywords => it should NOT escape it',
        args: ['NEWHOPE', 'EMPIRE', 'JEDI', 'VOID', 'IN', 'IF', 'ELSE', 'SWITCH', 'FACTORY'].map(v => {
          return { config, blockName: v, expected: v };
        }),
      },
      {
        title: 'defaultConfig => valid Dart Language Keywords => it should escape it',
        args: ['void', 'in', 'if', 'else', 'switch', 'factory'].map(v => {
          return { config, blockName: v, expected: `${v}_` };
        }),
      },
      {
        title:
          'defaultConfig => withCasing => should ignore both dartKeywordEscapeCasing and buildBlockName casing if casedBlockName is still a valid Dart Language Keyword',
        args: [undefined, 'snake_case', 'camelCase'].map(casing => {
          return { config, blockName: 'void', casing, expected: 'void_' };
        }),
      },
      {
        title:
          'defaultConfig => decorateWithAtJsonKey => should ignore both dartKeywordEscapeCasing and buildBlockName casing if casedBlockName is still a valid Dart Language Keyword',
        args: [undefined, 'snake_case', 'camelCase'].map(casing => {
          return {
            config,
            blockName: 'void',
            casing,
            decorateWithAtJsonKey: true,
            expected: `@JsonKey(name: 'void') void_`,
          };
        }),
      },
      {
        title:
          'prefixConfig => withCasing => should ignore both dartKeywordEscapeCasing and buildBlockName casing if casedBlockName is still a valid Dart Language Keyword',
        args: [undefined, 'snake_case', 'camelCase'].map(casing => {
          return {
            config: prefixConfig,
            blockName: 'void',
            casing,
            expected: 'k_void',
          };
        }),
      },
      {
        title:
          'prefixConfig => decorateWithAtJsonKey => should ignore both dartKeywordEscapeCasing and buildBlockName casing if casedBlockName is still a valid Dart Language Keyword',
        args: [undefined, 'snake_case', 'camelCase'].map(casing => {
          return {
            config: prefixConfig,
            blockName: 'void',
            casing,
            decorateWithAtJsonKey: true,
            expected: `@JsonKey(name: 'void') k_void`,
          };
        }),
      },
      {
        title:
          'suffixConfig => withCasing => should ignore both dartKeywordEscapeCasing and buildBlockName casing if casedBlockName is still a valid Dart Language Keyword',
        args: [undefined, 'snake_case', 'camelCase'].map(casing => {
          return {
            config: suffixConfig,
            blockName: 'void',
            casing,
            expected: 'void_k',
          };
        }),
      },
      {
        title:
          'suffixConfig => decorateWithAtJsonKey => should ignore both dartKeywordEscapeCasing and buildBlockName casing if casedBlockName is still a valid Dart Language Keyword',
        args: [undefined, 'snake_case', 'camelCase'].map(casing => {
          return {
            config: suffixConfig,
            blockName: 'void',
            casing,
            decorateWithAtJsonKey: true,
            expected: `@JsonKey(name: 'void') void_k`,
          };
        }),
      },
      {
        title:
          'prefixSuffixConfig => withCasing => should ignore both dartKeywordEscapeCasing and buildBlockName casing if casedBlockName is still a valid Dart Language Keyword',
        args: [undefined, 'snake_case', 'camelCase'].map(casing => {
          return {
            config: prefixSuffixConfig,
            blockName: 'void',
            casing,
            expected: 'k_void_k',
          };
        }),
      },
      {
        title:
          'prefixSuffixConfig => decorateWithAtJsonKey => should ignore both dartKeywordEscapeCasing and buildBlockName casing if casedBlockName is still a valid Dart Language Keyword',
        args: [undefined, 'snake_case', 'camelCase'].map(casing => {
          return {
            config: prefixSuffixConfig,
            blockName: 'void',
            casing,
            decorateWithAtJsonKey: true,
            expected: `@JsonKey(name: 'void') k_void_k`,
          };
        }),
      },
    ];

    test.each(data[0].args)(data[0].title, ({ config, blockName, expected }) => {
      expect(escapeDartKeyword(config, blockName)).toBe(expected);
      expect(buildBlockName(config, blockName)).toBe(expected);
    });

    test.each(data[1].args)(data[1].title, ({ config, blockName, expected }) => {
      expect(escapeDartKeyword(config, blockName)).toBe(expected);
      expect(buildBlockName(config, blockName)).toBe(expected);
    });

    test.each(data[2].args)(data[2].title, ({ config, blockName, casing, expected }) => {
      expect(escapeDartKeyword(config, blockName)).toBe(expected);
      expect(buildBlockName(config, blockName, undefined, casing)).toBe(expected);
      expect(buildBlockName(config, blockName, undefined, 'PascalCase')).toBe('Void');
    });

    test.each(data[3].args)(data[3].title, ({ config, blockName, casing, decorateWithAtJsonKey, expected }) => {
      expect(escapeDartKeyword(config, blockName)).toBe('void_');
      expect(buildBlockName(config, blockName, undefined, casing, decorateWithAtJsonKey)).toBe(expected);
      expect(buildBlockName(config, blockName, undefined, 'PascalCase', decorateWithAtJsonKey)).toBe(
        `@JsonKey(name: 'void') Void`
      );
    });

    test.each(data[4].args)(data[4].title, ({ config, blockName, casing, expected }) => {
      expect(escapeDartKeyword(config, blockName)).toBe(expected);
      expect(buildBlockName(config, blockName, undefined, casing)).toBe(casing === 'camelCase' ? 'kVoid' : expected);
      expect(buildBlockName(config, blockName, undefined, 'PascalCase')).toBe('KVoid');
    });

    test.each(data[5].args)(data[5].title, ({ config, blockName, casing, decorateWithAtJsonKey, expected }) => {
      expect(escapeDartKeyword(config, blockName)).toBe('k_void');
      expect(buildBlockName(config, blockName, undefined, casing, decorateWithAtJsonKey)).toBe(
        casing === 'camelCase' ? `@JsonKey(name: 'void') kVoid` : expected
      );
      expect(buildBlockName(config, blockName, undefined, 'PascalCase', decorateWithAtJsonKey)).toBe(
        `@JsonKey(name: 'void') KVoid`
      );
    });

    test.each(data[6].args)(data[6].title, ({ config, blockName, casing, expected }) => {
      expect(escapeDartKeyword(config, blockName)).toBe(expected);
      expect(buildBlockName(config, blockName, undefined, casing)).toBe(casing === 'camelCase' ? 'voidK' : expected);
      expect(buildBlockName(config, blockName, undefined, 'PascalCase')).toBe('VoidK');
    });

    test.each(data[7].args)(data[7].title, ({ config, blockName, casing, decorateWithAtJsonKey, expected }) => {
      expect(escapeDartKeyword(config, blockName)).toBe('void_k');
      expect(buildBlockName(config, blockName, undefined, casing, decorateWithAtJsonKey)).toBe(
        casing === 'camelCase' ? `@JsonKey(name: 'void') voidK` : expected
      );
      expect(buildBlockName(config, blockName, undefined, 'PascalCase', decorateWithAtJsonKey)).toBe(
        `@JsonKey(name: 'void') VoidK`
      );
    });

    test.each(data[8].args)(data[8].title, ({ config, blockName, casing, expected }) => {
      expect(escapeDartKeyword(config, blockName)).toBe(expected);
      expect(buildBlockName(config, blockName, undefined, casing)).toBe(casing === 'camelCase' ? 'kVoidK' : expected);
      expect(buildBlockName(config, blockName, undefined, 'PascalCase')).toBe('KVoidK');
    });

    test.each(data[9].args)(data[9].title, ({ config, blockName, casing, decorateWithAtJsonKey, expected }) => {
      expect(escapeDartKeyword(config, blockName)).toBe('k_void_k');
      expect(buildBlockName(config, blockName, undefined, casing, decorateWithAtJsonKey)).toBe(
        casing === 'camelCase' ? `@JsonKey(name: 'void') kVoidK` : expected
      );
      expect(buildBlockName(config, blockName, undefined, 'PascalCase', decorateWithAtJsonKey)).toBe(
        `@JsonKey(name: 'void') KVoidK`
      );
    });
  });

  describe('block builders => ', () => {
    const config = mergeConfig();

    const validBlockNames = [
      'Episode',
      'Movie',
      'CreateMovieInput',
      'UpsertMovieInput',
      'UpdateMovieInput',
      'DeleteMovieInput',
      'Starship',
      'Character',
      'MovieCharacter',
      'Human',
      'Droid',
      'SearchResult',
    ];

    test.each(validBlockNames)('returns a blockHeader', blockName => {
      expect(buildEnumHeader(config, blockName)).toBe(`enum ${blockName} {\n`);

      const privateEmptyConstructor = indent(`const ${blockName}._();\n\n`);
      expect(buildClassHeader(config, blockName)).toBe(
        `class ${blockName} with _$${blockName} {\n${privateEmptyConstructor}`
      );
      expect(buildClassHeader(config, blockName, false)).toBe(`class ${blockName} with _$${blockName} {\n`);

      const fromJsonToJson = indent(
        `factory ${blockName}.fromJson(Map<String, dynamic> json) => _$${blockName}FromJson(json);\n}\n\n`
      );
      expect(buildClassFooter(config, blockName)).toBe(fromJsonToJson);
      expect(buildClassFooter(config, blockName, false)).toBe(`}\n\n`);
    });

    expect(buildEnumFooter()).toBe(`}\n\n`);

    describe('method:  buildBlock() => enumBlock', () => {
      const node = astNodesList[0] as NodeType;
      const expected = [
        `enum Episode {`,
        indent(`@JsonKey(name: 'NEWHOPE') newhope,`),
        indent(`@JsonKey(name: 'EMPIRE') empire,`),
        indent(`@JsonKey(name: 'JEDI') jedi,`),
        indent(`@JsonKey(name: 'VOID') void_,`),
        indent(`@JsonKey(name: 'void') void_,`),
        indent(`@JsonKey(name: 'IN') in_,`),
        indent(`@JsonKey(name: 'in') in_,`),
        indent(`@JsonKey(name: 'ELSE') else_,`),
        indent(`@JsonKey(name: 'else') else_,`),
        indent(`@JsonKey(name: 'SWITCH') switch_,`),
        indent(`@JsonKey(name: 'switch') switch_,`),
        indent(`@JsonKey(name: 'FACTORY') factory_,`),
        indent(`@JsonKey(name: 'factory') factory_,`),
      ];
      expect(buildBlock(config, node, new NodeRepository())).toBe(
        expected.concat([indent(`male,`), indent(`female,`), indent(`phoneNumber,`), `}\n\n`]).join('\n')
      );

      expect(
        buildBlock(
          mergeConfig(config, { globalFreezedConfig: { alwaysUseJsonKeyName: true } }),
          node,
          new NodeRepository()
        )
      ).toBe(
        expected
          .concat([
            indent(`@JsonKey(name: 'male') male,`),
            indent(`@JsonKey(name: 'female') female,`),
            indent(`@JsonKey(name: 'phoneNumber') phoneNumber,`),
            `}\n\n`,
          ])
          .join('\n')
      );
    });

    describe('method:  buildBlock() => classBlock', () => {
      const config = mergeConfig();
      const node = astNodesList[1] as NodeType;
      const nodeRepository = new NodeRepository();
      const expected = [
        `@freezed`,
        `class Movie with _$Movie {`,
        indent(`const Movie._();\n`),
        indent(`==>factory==>Movie`),
      ];

      expect(buildBlock(config, node, nodeRepository)).toBe(
        expected
          .concat([indent(`factory Movie.fromJson(Map<String, dynamic> json) => _$MovieFromJson(json);`), `}\n\n`])
          .join('\n')
      );

      expect(
        buildBlock(mergeConfig(config, { globalFreezedConfig: { fromJsonToJson: false } }), node, new NodeRepository())
      ).toBe(expected.concat([`}\n\n`]).join('\n'));

      describe('method:  buildBlock() => factoryBlock', () => {
        const config = mergeConfig();
        // const placeholder = indent(`==>factory==>Movie\n`);
        // const blockName = 'Movie'; // TODO: get blockName from placeholder

        const node = nodeRepository.get('Movie');
        const expected = [`const factory Movie({`];
        if (node) {
          expect(FreezedFactoryBlock.buildFromFactory(config, node)).toBe(
            expected
              .concat([indent(`required  String id,`, 2), indent(`required  String title,`, 2), `}) = _Movie;\n`])
              .join('\n')
          );
        }
      });
    });
  });
});
