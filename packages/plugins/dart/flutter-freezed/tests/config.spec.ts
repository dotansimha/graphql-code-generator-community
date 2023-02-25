import { Config } from '../src/config/config-value.js';
import {
  FieldName,
  FieldNamePattern,
  Pattern,
  TypeName,
  TypeNamePattern,
} from '../src/config/pattern.js';
import {
  APPLIES_ON_DEFAULT_FACTORY_PARAMETERS,
  APPLIES_ON_MERGED_FACTORY_PARAMETERS,
  APPLIES_ON_PARAMETERS,
  APPLIES_ON_UNION_FACTORY_PARAMETERS,
  AppliesOnFactory,
  AppliesOnParameters,
  DART_KEYWORDS,
  DART_SCALARS,
  defaultFreezedPluginConfig,
} from '../src/config/plugin-config.js';

describe("integrity checks: ensures that these values don't change and if they do, they're updated accordingly", () => {
  test('integrity check: DART_SCALARS contains corresponding Dart Types mapping for built-in Graphql Scalars', () => {
    expect(DART_SCALARS).toMatchObject({
      ID: 'String',
      String: 'String',
      Boolean: 'bool',
      Int: 'int',
      Float: 'double',
      DateTime: 'DateTime',
    });
  });

  test('integrity check: All DART_KEYWORDS are accounted for', () => {
    expect(DART_KEYWORDS).toMatchObject({
      abstract: 'built-in',
      else: 'reserved',
      import: 'built-in',
      show: 'context',
      as: 'built-in',
      enum: 'reserved',
      in: 'reserved',
      static: 'built-in',
      assert: 'reserved',
      export: 'built-in',
      interface: 'built-in',
      super: 'reserved',
      async: 'context',
      extends: 'reserved',
      is: 'reserved',
      switch: 'reserved',
      await: 'async-reserved',
      extension: 'built-in',
      late: 'built-in',
      sync: 'context',
      break: 'reserved',
      external: 'built-in',
      library: 'built-in',
      this: 'reserved',
      case: 'reserved',
      factory: 'built-in',
      mixin: 'built-in',
      throw: 'reserved',
      catch: 'reserved',
      false: 'reserved',
      new: 'reserved',
      true: 'reserved',
      class: 'reserved',
      final: 'reserved',
      null: 'reserved',
      try: 'reserved',
      const: 'reserved',
      finally: 'reserved',
      on: 'context',
      typedef: 'built-in',
      continue: 'reserved',
      for: 'reserved',
      operator: 'built-in',
      var: 'reserved',
      covariant: 'built-in',
      Function: 'built-in',
      part: 'built-in',
      void: 'reserved',
      default: 'reserved',
      get: 'built-in',
      required: 'built-in',
      while: 'reserved',
      deferred: 'built-in',
      hide: 'context',
      rethrow: 'reserved',
      with: 'reserved',
      do: 'reserved',
      if: 'reserved',
      return: 'reserved',
      yield: 'async-reserved',
      dynamic: 'built-in',
      implements: 'built-in',
      set: 'built-in',
      // built-in types
      int: 'reserved',
      double: 'reserved',
      String: 'reserved',
      bool: 'reserved',
      List: 'reserved',
      Set: 'reserved',
      Map: 'reserved',
      Runes: 'reserved',
      Symbol: 'reserved',
      Object: 'reserved',
      Null: 'reserved',
      Never: 'reserved',
      Enum: 'reserved',
      Future: 'reserved',
      Iterable: 'reserved',
    });
  });

  test('integrity check: plugin config defaults are set', () => {
    expect(defaultFreezedPluginConfig).toMatchObject({
      camelCasedEnums: true,
      copyWith: undefined,
      customScalars: {},
      defaultValues: undefined,
      deprecated: undefined,
      equal: undefined,
      escapeDartKeywords: true,
      final: undefined,
      // fromJsonToJson: true,
      ignoreTypes: undefined,
      immutable: true,
      makeCollectionsUnmodifiable: undefined,
      mergeTypes: undefined,
      mutableInputs: true,
      privateEmptyConstructor: true,
      unionClass: undefined,
    });
  });
});

const Droid = TypeName.fromString('Droid');
const Starship = TypeName.fromString('Starship');
const Human = TypeName.fromString('Human');
const Movie = TypeName.fromString('Movie');

const id = FieldName.fromString('id');
const name = FieldName.fromString('name');
const friends = FieldName.fromString('friends');
const friend = FieldName.fromString('friend');
const title = FieldName.fromString('title');
const episode = FieldName.fromString('episode');
const length = FieldName.fromString('length');

describe('Config: has methods that returns a ready-to-use value for all the config options', () => {
  describe('Config.camelCasedEnums(...): returns a `DartIdentifierCasing` or `undefined`', () => {
    const config = Config.create({});
    it('config.camelCasedEnums: defaults to `true`', () => {
      expect(config.camelCasedEnums).toBe(true);
    });

    it('returns `camelCase` if set to `true`. Defaults to `true`', () => {
      expect(Config.camelCasedEnums(config)).toBe('camelCase');
    });

    it('allow to you to specify your preferred casing', () => {
      config.camelCasedEnums = 'PascalCase';
      expect(Config.camelCasedEnums(config)).toBe('PascalCase');
    });

    it('can be disabled by setting it to `false` or `undefined`', () => {
      config.camelCasedEnums = undefined;
      expect(Config.camelCasedEnums(config)).toBeUndefined();
      config.camelCasedEnums = false;
      expect(Config.camelCasedEnums(config)).toBeUndefined();
    });
  });

  describe('Config.customScalars(...): returns an equivalent Dart Type for a given Graphql Scalar Type', () => {
    const config = Config.create({});
    it('config.customScalars: defaults to an empty object `{}`', () => {
      expect(config.customScalars).toMatchObject({});
    });

    // tell Dart how to handle your custom Graphql Scalars by mapping them to an corresponding Dart type
    config.customScalars = {
      jsonb: 'Map<String, dynamic>',
      timestamp: 'DateTime',
      UUID: 'String',
    };

    describe.each([
      // [scalar, dart-type]
      ['jsonb', 'Map<String, dynamic>'],
      ['timestamp', 'DateTime'],
      ['UUID', 'String'],
    ])('returns the equivalent Dart Type from the config', (scalar, dartType) => {
      it(`the Dart equivalent of scalar: '${scalar}' is Dart type: '${dartType}'`, () => {
        expect(Config.customScalars(config, scalar)).toBe(dartType);
      });
    });

    describe.each([
      // [scalar, dart-type]
      ['ID', 'String'],
      ['String', 'String'],
      ['Boolean', 'bool'],
      ['Int', 'int'],
      ['Float', 'double'],
      ['DateTime', 'DateTime'],
    ])('returns the equivalent Dart Type from the DART_SCALARS', (scalar, dartType) => {
      it(`the Dart equivalent of scalar: '${scalar}' is Dart type: '${dartType}'`, () => {
        expect(Config.customScalars(config, scalar)).toBe(dartType);
      });
    });

    test('you can override the DART_SCALARS with the config', () => {
      expect(Config.customScalars(config, 'ID')).toBe('String');
      config.customScalars = { ...config.customScalars, ID: 'int' };
      expect(Config.customScalars(config, 'ID')).toBe('int');
    });

    it('returns the Graphql Scalar if no equivalent type is found', () => {
      expect(Config.customScalars(config, 'NanoId')).toBe('NanoId');
    });

    it('is case-sensitive: returns the Graphql Scalar if no equivalent type is found', () => {
      expect(Config.customScalars(config, 'UUID')).toBe('String');
      expect(Config.customScalars(config, 'uuid')).toBe('uuid');
    });

    test('order of precedence: config > DART_SCALARS > graphql scalar', () => {
      config.customScalars = undefined;
      expect(Config.customScalars(config, 'ID')).toBe('String');
      expect(Config.customScalars(config, 'uuid')).toBe('uuid');
    });
  });

  describe('Config.defaultValue(...): sets the default value of a parameter/field', () => {
    describe('different values can be set for each block type:', () => {
      const config = Config.create({
        defaultValues: [
          [
            FieldNamePattern.forFieldNamesOfTypeName([[[Human, Droid], id]]),
            `'id:1'`,
            ['merged_factory_parameter'],
          ],
          [
            FieldNamePattern.forFieldNamesOfTypeName([[[Human, Droid], id]]),
            `'id:2'`,
            ['default_factory_parameter'],
          ],
          [
            FieldNamePattern.forFieldNamesOfTypeName([[[Human, Droid], id]]),
            `'id:3'`,
            ['union_factory_parameter'],
          ],
        ],
      });

      it.each([Human, Droid])(
        'each block type returns a decorator with a different value:',
        typeName => {
          expect(Config.defaultValues(config, APPLIES_ON_PARAMETERS, typeName, id)).toBe(
            `@Default('id:3')\n`,
          );
          expect(
            Config.defaultValues(config, APPLIES_ON_DEFAULT_FACTORY_PARAMETERS, typeName, id),
          ).toBe(`@Default('id:2')\n`);
          expect(
            Config.defaultValues(config, APPLIES_ON_UNION_FACTORY_PARAMETERS, typeName, id),
          ).toBe(`@Default('id:3')\n`);
          expect(
            Config.defaultValues(config, APPLIES_ON_MERGED_FACTORY_PARAMETERS, typeName, id),
          ).toBe(`@Default('id:1')\n`);
        },
      );

      it.each([Movie, Starship])('the following will return an empty string', typeName => {
        expect(Config.defaultValues(config, APPLIES_ON_PARAMETERS, typeName, id)).toBe('');
        expect(
          Config.defaultValues(config, APPLIES_ON_DEFAULT_FACTORY_PARAMETERS, typeName, id),
        ).toBe('');
        expect(
          Config.defaultValues(config, APPLIES_ON_UNION_FACTORY_PARAMETERS, typeName, id),
        ).toBe('');
        expect(
          Config.defaultValues(config, APPLIES_ON_MERGED_FACTORY_PARAMETERS, typeName, id),
        ).toBe('');
      });
    });

    describe('the same value can be set for all block type:', () => {
      const config = Config.create({
        defaultValues: [
          [
            FieldNamePattern.forFieldNamesOfTypeName([[[Human, Droid], id]]),
            `'id:1'`,
            ['merged_factory_parameter', 'default_factory_parameter'],
          ],
        ],
      });

      it.each([Human, Droid])(
        'each block type returns a decorator with the same value:',
        typeName => {
          expect(
            Config.defaultValues(config, APPLIES_ON_MERGED_FACTORY_PARAMETERS, typeName, id),
          ).toBe(`@Default('id:1')\n`);
          expect(
            Config.defaultValues(config, APPLIES_ON_DEFAULT_FACTORY_PARAMETERS, typeName, id),
          ).toBe(`@Default('id:1')\n`);
        },
      );

      it.each([Human, Droid])('the following will return an empty string', typeName => {
        expect(
          Config.defaultValues(config, APPLIES_ON_UNION_FACTORY_PARAMETERS, typeName, id),
        ).toBe('');
      });

      it.each([Movie, Starship])('the following will return an empty string', typeName => {
        expect(Config.defaultValues(config, APPLIES_ON_PARAMETERS, typeName, id)).toBe('');
        expect(
          Config.defaultValues(config, APPLIES_ON_DEFAULT_FACTORY_PARAMETERS, typeName, id),
        ).toBe('');
        expect(
          Config.defaultValues(config, APPLIES_ON_UNION_FACTORY_PARAMETERS, typeName, id),
        ).toBe('');
      });
    });
  });

  describe('Config.deprecated(...): marks a factory or a parameter as deprecated', () => {
    const config = Config.create({
      deprecated: [
        [TypeNamePattern.forTypeNames([Movie, Starship]), ['merged_factory', 'default_factory']],
        [FieldNamePattern.forAllFieldNamesOfTypeName([Movie, Droid]), ['union_factory_parameter']],
        [FieldNamePattern.forAllFieldNamesOfTypeName([Droid]), ['default_factory_parameter']],
      ],
    });
    type T = (AppliesOnFactory | AppliesOnParameters)[];

    describe('some parameters can be marked as deprecated', () => {
      it.each([
        [Movie, id, 'union_factory_parameter'],
        [Movie, name, 'union_factory_parameter'],
        [Movie, friends, 'union_factory_parameter'],
        [Movie, friends, 'union_factory_parameter'],
        [Movie, title, 'union_factory_parameter'],
        [Movie, episode, 'union_factory_parameter'],
        [Movie, length, 'union_factory_parameter'],

        [Droid, id, 'union_factory_parameter'],
        [Droid, name, 'union_factory_parameter'],
        [Droid, friends, 'union_factory_parameter'],
        [Droid, friends, 'union_factory_parameter'],
        [Droid, title, 'union_factory_parameter'],
        [Droid, episode, 'union_factory_parameter'],
        [Droid, length, 'union_factory_parameter'],

        [Droid, id, 'default_factory_parameter'],
        [Droid, name, 'default_factory_parameter'],
        [Droid, friends, 'default_factory_parameter'],
        [Droid, friends, 'default_factory_parameter'],
        [Droid, title, 'default_factory_parameter'],
        [Droid, episode, 'default_factory_parameter'],
        [Droid, length, 'default_factory_parameter'],
      ])('%s.%s is deprecated:', (typeName, fieldName, configAppliesOn) => {
        expect(Config.deprecated(config, [configAppliesOn] as T, typeName, fieldName)).toBe(
          '@deprecated\n',
        );
        expect(Config.deprecated(config, [configAppliesOn] as T, typeName, fieldName)).toBe(
          '@deprecated\n',
        );
      });
    });

    describe('the whole factory block can be marked as deprecated', () => {
      it.each([Movie, Starship])('%s is deprecated:', typeName => {
        expect(Config.deprecated(config, ['merged_factory'], typeName)).toBe('@deprecated\n');
        expect(Config.deprecated(config, ['default_factory'], typeName)).toBe('@deprecated\n');
      });

      it.each([Movie, Starship])('%s is not deprecated:', typeName => {
        expect(Config.deprecated(config, ['union_factory'], typeName)).toBe('');
      });
    });
  });

  describe('Config.findLastConfiguration(...): runs through the pattern given and returns true if the typeName and/or fieldName should be configured:`', () => {
    const pattern = Pattern.compose([
      FieldNamePattern.forFieldNamesOfTypeName([
        [
          [Droid, Human],
          [name, friends],
        ],
      ]),
      TypeNamePattern.forAllTypeNamesExcludeTypeNames([Starship, Droid]),
      FieldNamePattern.forFieldNamesOfAllTypeNames([id, title]),
    ]);

    describe.each([Human, Movie])('the following typeNames will be configured:', typeName => {
      it(`${typeName.value} will be configured`, () => {
        expect(Pattern.findLastConfiguration(pattern, typeName)).toBe(true);
      });
    });

    describe.each([Droid, Starship])(
      'the following typeNames will not be configured:',
      typeName => {
        it(`${typeName.value} will not be configured`, () => {
          expect(Pattern.findLastConfiguration(pattern, typeName)).toBe(false);
        });
      },
    );

    describe.each([
      [Droid, id],
      [Droid, name],
      [Droid, friends],
      [Droid, title],

      [Starship, id],
      [Starship, title],

      [Human, id],
      [Human, name],
      [Human, friends],
      [Human, title],

      [Movie, id],
      [Movie, title],
    ])('the following typeName.fieldName will be configured:', (typeName, fieldName) => {
      it(`${typeName.value}.${fieldName.value} will be configured`, () => {
        expect(Pattern.findLastConfiguration(pattern, typeName, fieldName)).toBe(true);
      });
    });

    describe.each([
      [Droid, friend],
      [Droid, episode],
      [Droid, length],

      [Starship, friend],
      [Starship, episode],
      [Starship, length],

      [Human, friend],
      [Human, episode],
      [Human, length],

      [Movie, friend],
      [Movie, episode],
      [Movie, length],
    ])('the following typeNames will not be configured:', (typeName, fieldName) => {
      it(`${typeName.value}.${fieldName.value} will not be configured`, () => {
        expect(Pattern.findLastConfiguration(pattern, typeName, fieldName)).toBe(false);
      });
    });
  });
});
