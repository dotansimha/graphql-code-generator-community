import {
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  ObjectTypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { FieldNamePattern, Pattern, TypeName, TypeNamePattern } from './pattern.js';

//#region PluginConfig
/**
 * @name FlutterFreezedPluginConfig
 * @description configure the `flutter-freezed` plugin
 */
export type FlutterFreezedPluginConfig = {
  /**
   * @name camelCasedEnums
   * @type {(boolean | DartIdentifierCasing)}
   * @default true
   * @summary Specify how Enum values should be cased.
   * @description Setting this option to `true` will camelCase enum values as required by Dart's recommended linter.
   *
   * If set to false, the original casing as specified in the Graphql Schema is used
   *
   * You can also transform the casing by specifying your preferred casing for Enum values.
   *
   * Available options are: `'snake_case'`, `'camelCase'` and `'PascalCase'`
   *
   * For consistency, this option applies the same configuration to all Enum Types in the GraphQL Schema
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           camelCasedEnums: true, // or false
   *           // OR: specify a DartIdentifierCasing
   *           camelCasedEnums: 'snake_case',
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  camelCasedEnums?: boolean | DartIdentifierCasing;

  /**
   * @name copyWith
   * @type {(boolean | TypeNamePattern)}
   * @default undefined
   * @see {@link https://pub.dev/packages/freezed#how-copywith-works How copyWith works}
   * @see {@link https://pub.dev/documentation/freezed_annotation/latest/freezed_annotation/Freezed/copyWith.html Freezed annotation copyWith property}
   * @summary enables Freezed copyWith helper method
   * @description The [`freezed`](https://pub.dev/packages/freezed) library has this option enabled by default.
   * Use this option to enable/disable this option completely.
   *
   *  The plugin by default generates immutable Freezed models using the `@freezed` decorator.
   *
   * If this option is configured, the plugin will generate immutable Freezed models using the `@Freezed(copyWith: value)` instead.
   *
   * Setting a boolean value will enable/disable this option globally for every GraphQL Type
   * but you can also set this option to `true` for one or more GraphQL Types using a `TypeNamePattern`.
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const Droid = TypeName.fromString('Droid');
   * const Starship = TypeName.fromString('Starship');
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           copyWith: true,
   *           // OR: enable it for only Droid and Starship GraphQL types
   *           copyWith: TypeNamePattern.forTypeNames([Droid, Starship]),
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  copyWith?: boolean | TypeNamePattern;

  /**
   * @name customScalars
   * @type {(Record<string, string>)}
   * @default {}
   * @summary Maps GraphQL Scalar Types to Dart built-in types
   * @description The `key` is the GraphQL Scalar Type and the `value` is the equivalent Dart Type
   *
   * The plugin automatically handles built-in GraphQL Scalar Types so only specify the custom Scalars in your Graphql Schema.
   * @exampleMarkdown
   * ## Usage
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           customScalars: {
   *             jsonb: 'Map<String, dynamic>',
   *             timestamp: 'DateTime',
   *             UUID: 'String',
   *           },
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  customScalars?: Record<string, string>;

  /**
   * @name defaultValues
   * @type {([pattern: FieldNamePattern, value: string, appliesOn: AppliesOnParameters[]][])}
   * @default undefined
   * @see {@link https://pub.dev/packages/freezed#default-values Default values}
   * @see {@link https://pub.dev/documentation/freezed_annotation/latest/freezed_annotation/Default-class.html Default class}
   * @summary set the default value for a field.
   * @description This will annotate the generated parameter with a `@Default(value: defaultValue)` decorator.
   *
   * The default value will be interpolated into the `@Default(value: ${value})` decorator so
   *  Use backticks for the value element so that you can use quotation marks for string values.
   * E.g: `"I'm a string default value"` but `Episode.jedi` is not a string value.
   *
   * Use the `appliesOn` to specify where this option should be applied on
   *
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const MovieCharacter = TypeName.fromString('MovieCharacter');
   * const appearsIn = FieldName.fromString('appearsIn');
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           defaultValues: [
   *             [FieldNamePattern.forFieldNamesOfTypeName(MovieCharacter, appearsIn), `Episode.jedi`, ['default_factory_parameter']],
   *           ],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  defaultValues?: [
    pattern: FieldNamePattern,
    value: string, // use backticks for string values
    appliesOn: AppliesOnParameters[],
  ][];

  /**
   * @name deprecated
   * @type {([pattern: Pattern, appliesOn: (AppliesOnFactory | AppliesOnParameters)[]][])}
   * @default undefined
   * @see {@link https://pub.dev/packages/freezed#decorators-and-comments Decorators and comments}
   * @summary a list of Graphql Types(factory constructors) or fields(parameters) to be marked as deprecated.
   * @description Using a TypeNamePattern, you can mark an entire factory constructor for one or more GraphQL types as deprecated.
   *
   * Likewise, using a FieldNamePattern, you can mark one or more fields as deprecated
   *
   * Since the first element in the tuple has a type signature of `Pattern`,
   * you can use either TypeNamePattern or FieldNamePattern or use both
   * by composing them with `Pattern.compose(...)`
   *
   * Use the `appliesOn` to specify which block this option should be applied on
   * @exampleMarkdown
   * ## Usage:
   *
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const MovieCharacter = TypeName.fromString('MovieCharacter');
   * const Droid = TypeName.fromString('Droid');
   * const Starship = TypeName.fromString('Starship');
   * const Human = TypeName.fromString('Human');
   *
   * const name = FieldName.fromString('name');
   * const appearsIn = FieldName.fromString('appearsIn');
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           deprecated: [
   *             // using FieldNamePattern
   *             [FieldNamePattern.forFieldNamesOfTypeName(MovieCharacter, [appearsIn, name]), ['default_factory_parameter']],
   *             // using TypeNamePattern
   *             [TypeNamePattern.forTypeNames([Starship,Droid,Human]), ['union_factory']],
   *           ],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  deprecated?: [pattern: Pattern, appliesOn: (AppliesOnFactory | AppliesOnParameters)[]][];

  /**
   * @name equal
   * @type {(boolean | TypeNamePattern)}
   * @default undefined
   * @see {@link https://pub.dev/packages/freezed#changing-the-behavior-for-a-specific-model Freezed equal helper method usage}
   * @see {@link https://pub.dev/documentation/freezed_annotation/latest/freezed_annotation/Freezed/equal.html Freezed annotation equal property}
   * @summary enables Freezed equal helper method
   * @description The [`freezed`](https://pub.dev/packages/freezed) library has this option enabled by default.
   * Use this option to enable/disable this option completely.
   *
   *  The plugin by default generates immutable Freezed models using the `@freezed` decorator.
   *
   * If this option is configured, the plugin will generate immutable Freezed models using the `@Freezed(equal: value)` instead.
   *
   * Setting a boolean value will enable/disable this option globally for every GraphQL Type
   * but you can also set this option to `true` for one or more GraphQL Types using a `TypeNamePattern`.
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const Droid = TypeName.fromString('Droid');
   * const Starship = TypeName.fromString('Starship');
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           equal: true,
   *           // OR: enable it for only Droid and Starship GraphQL types
   *           equal: TypeNamePattern.forTypeNames([Droid, Starship]),
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  equal?: boolean | TypeNamePattern;

  /**
   * @name escapeDartKeywords
   * @type {(boolean | [pattern: Pattern, prefix?: string, suffix?: string, appliesOn?: AppliesOn[]][])}
   * @default true
   * @see_also [dartKeywordEscapePrefix,dartKeywordEscapeSuffix]
   * @summary ensures that the generated Freezed models do not use any of Dart's reserved keywords as identifiers
   * @description Wraps the fields names that are valid Dart keywords with the prefix and suffix given
   *
   * @exampleMarkdown
   * ## Usage:
   *
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const Episode = TypeName.fromString('Episode');
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           // WARNING: Setting this option to `false` might generate output that contains Dart keywords as identifiers. Defaults to `true`
   *           escapeDartKeywords: false,
   *           // OR configure how Dart keywords are handled for each type
   *           escapeDartKeywords: [
   *             [
   *               Pattern.compose([
   *                 TypeNamePattern.forAllTypeNames(),
   *                 FieldNamePattern.forAllFieldNamesOfTypeName([Episode]),
   *               ]),
   *               // `prefix`: defaults to an empty string `''` if undefined.
   *               // WARNING: Note that using a underscore `_` as a prefix will make the field as private
   *               undefined,
   *               // `suffix`: defaults to an underscore `_` if undefined
   *               undefined,
   *               // `appliesOn`: defaults to an ['enum', 'enum_value', 'class', 'factory', 'parameter'] if undefined.
   *               undefined,
   *             ],
   *           ],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  escapeDartKeywords?:
    | boolean
    | [pattern: Pattern, prefix?: string, suffix?: string, appliesOn?: AppliesOn[]][];

  /**
   * @name final
   * @type {([pattern: FieldNamePattern, appliesOn: AppliesOnParameters[]][])}
   * @default undefined
   * @see {@link https://pub.dev/packages/freezed#defining-a-mutable-class-instead-of-an-immutable-one Freezed annotation equal property}
   * @summary  marks fields as final
   * @description This will mark the specified parameters as final
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const id = FieldName.fromString('id');
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           final: [[FieldNamePattern.forFieldNamesOfAllTypeNames([id]), ['parameter']]],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  final?: [pattern: FieldNamePattern, appliesOn: AppliesOnParameters[]][];

  /**
   * @name ignoreTypes
   * @type {(TypeNamePattern)}
   * @default undefined
   * @description names of GraphQL types to ignore when generating Freezed classes
   *
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const PaginatorInfo = TypeName.fromString('PaginatorInfo');
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           ignoreTypes: TypeNamePattern.forTypeNames([PaginatorInfo]),
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  ignoreTypes?: TypeNamePattern;

  /**
   * @name immutable
   * @type {(boolean | TypeNamePattern)}
   * @default undefined
   * @see {@link https://pub.dev/packages/freezed#creating-a-model-using-freezed Creating a Model using Freezed}
   * @summary enables Freezed immutable helper method
   * @description  set to true to use the `@freezed` decorator or false to use the `@unfreezed` decorator
   * @description The [`freezed`](https://pub.dev/packages/freezed) library  by default generates immutable models decorated with the `@freezed` decorator.
   * This option if set to `false` the plugin will generate mutable Freezed models using the `@unfreezed` decorator instead.
   *
   * Setting a boolean value will enable/disable this option globally for every GraphQL Type
   * but you can also set this option to `true` for one or more GraphQL Types using a `TypeNamePattern`.
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const Droid = TypeName.fromString('Droid');
   * const Starship = TypeName.fromString('Starship');
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           immutable: true,
   *           // OR: enable it for all GraphQL types except Droid and Starship types
   *           immutable: TypeNamePattern.forTypeNamesExcludeTypeNames([Droid, Starship]),
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  immutable?: boolean | TypeNamePattern;

  /**
   * @name makeCollectionsUnmodifiable
   * @type {(boolean | TypeNamePattern)}
   * @default undefined
   * @see {@link https://pub.dev/packages/freezed#allowing-the-mutation-of-listsmapssets Allowing the mutation of Lists/Maps/Sets}
   * @description allows collections(lists/maps) to be modified even if class is immutable
   *
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const Droid = TypeName.fromString('Droid');
   * const Starship = TypeName.fromString('Starship');
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           makeCollectionsUnmodifiable: true,
   *           // OR: enable it for only Droid and Starship GraphQL types
   *           makeCollectionsUnmodifiable: TypeNamePattern.forTypeNames([Droid, Starship]),
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  makeCollectionsUnmodifiable?: boolean | TypeNamePattern;

  /**
   * @name mergeTypes
   * @type {(Record<string, TypeName[]>)}
   * @default undefined
   * @description maps over the value(array of typeNames) and transform each as a named factory constructor inside a class generated for the key(target GraphQL Object Type).
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const Movie = TypeName.fromString('Movie');
   * const CreateMovieInput = TypeName.fromString('CreateMovieInput');
   * const UpdateMovieInput = TypeName.fromString('UpdateMovieInput');
   * const UpsertMovieInput = TypeName.fromString('UpsertMovieInput');
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *          mergeTypes: {
   *            [Movie.value]: [CreateMovieInput, UpdateMovieInput, UpsertMovieInput],
   *          },
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  mergeTypes?: Record<string, TypeName[]>;

  /**
   * @name mutableInputs
   * @description  since inputs will be used to collect data, it makes sense to make them mutable with Freezed's `@unfreezed` decorator.
   *
   * This overrides(in order words: has a higher precedence than) the `immutable` config value `ONLY` for GraphQL `input types`.
   * @default true
   *
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const CreateMovieInput = TypeName.fromString('CreateMovieInput');
   * const UpdateMovieInput = TypeName.fromString('UpdateMovieInput');
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           mutableInputs: true,
   *           // OR: enable it for only Droid and Starship GraphQL types
   *           mutableInputs: TypeNamePattern.forTypeNames([CreateMovieInput, UpdateMovieInput]),
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  mutableInputs?: boolean | TypeNamePattern;

  /**
   * @name privateEmptyConstructor
   * @description if true, defines a private empty constructor to allow getter and methods to work on the class
   * @default true
   *
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const Droid = TypeName.fromString('Droid');
   * const Starship = TypeName.fromString('Starship');
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           privateEmptyConstructor: true,
   *           // OR: enable it for only Droid and Starship GraphQL types
   *           privateEmptyConstructor: TypeNamePattern.forTypeNames([Droid, Starship]),
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  privateEmptyConstructor?: boolean | TypeNamePattern;

  /**
   * @name unionClass
   * @description customize the key to be used for fromJson with multiple constructors
   * @see {@link https://pub.dev/packages/freezed#fromjson---classes-with-multiple-constructors fromJSON - classes with multiple constructors}
   * @default undefined
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           unionClass: [
   *             [
   *               'SearchResult', // <-- unionTypeName
   *               'namedConstructor', // <-- unionKey
   *               'FreezedUnionCase.pascal', // <-- unionValueCase
   *               [ // <-- unionValuesNameMap
   *                [ Droid, 'special droid'],
   *                [ Human, 'astronaut'],
   *                [ Starship, 'space_Shuttle'],
   *               ],
   *             ],
   *           ],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  unionClass?: [
    /**
     * The name of the Graphql Union Type (or in the case of merged types, the base type on which other types are merged with)
     */
    unionTypeName: TypeNamePattern,

    /**
     * in a fromJSON/toJson encoding a response/object({key:value}), you can specify what name should be used as the key ?
     */
    unionKey?: string,

    /**
     * normally in camelCase but you can change that to PascalCase
     */
    unionValueCase?: UnionValueCase,

    /**
     * just as the unionKey changes the key used, this changes the value for each union/sealed factories
     */
    unionValuesNameMap?: [typeName: TypeName, unionValueKey: string][],
  ][];
};

//#endregion

//#region type alias

/**
 * @name ApplyDecoratorOn
 * @description Values that are passed to the `DecoratorToFreezed.applyOn` field that specifies where the custom decorator should be applied
 */
export type AppliesOn =
  | 'enum' // applies on the Enum itself
  | 'enum_value' // applies to the value of an Enum
  | 'class' // applies on the class itself
  | 'factory' // applies on all class factory constructor
  | 'default_factory' // applies on the main default factory constructor
  | 'named_factory' // applies on all of the named factory constructors in a class
  | 'union_factory' // applies on the named factory constructors for a specified(or all when the `*` is used as the key) GraphQL Object Type when it appears in a class as a named factory constructor and that class was generated for a GraphQL Union Type. E.g: `Droid` in `SearchResult` in the StarWars Schema
  | 'merged_factory' // applies on the named factory constructors for a GraphQL Input Type when it appears in a class as a named factory constructor and that class was generated for a GraphQL Object Type and it Type is to be merged with the GraphQL Object Type. E.g: `CreateMovieInput` merged with `Movie` in the StarWars Schema
  | 'parameter' // applies on all parameters for both default constructors and named factory constructors
  | 'default_factory_parameter' // applies on parameters for ONLY default constructors for a specified(or all when the `*` is used as the key) field on a GraphQL Object/Input Type
  | 'named_factory_parameter' // applies on parameters for all named factory constructors for a specified(or all when the `*` is used as the key) field on a GraphQL Object/Input Type
  | 'union_factory_parameter' // like `named_factory_parameters` but ONLY for a parameter in a named factory constructor which for a GraphQL Union Type
  | 'merged_factory_parameter'; // like `named_factory_parameters` but ONLY for a parameter in a named factory constructor which for a GraphQL Input Type that is merged inside an a class generated for a GraphQL Object Type

export const APPLIES_ON_ENUM = ['enum'] as const;
export type AppliesOnEnum = (typeof APPLIES_ON_ENUM)[number];

export const APPLIES_ON_ENUM_VALUE = ['enum_value'] as const;
export type AppliesOnEnumValue = (typeof APPLIES_ON_ENUM_VALUE)[number];

export const APPLIES_ON_CLASS = ['class'] as const;
export type AppliesOnClass = (typeof APPLIES_ON_CLASS)[number];

export const APPLIES_ON_DEFAULT_FACTORY = ['factory', 'default_factory'] as const;
export type AppliesOnDefaultFactory = (typeof APPLIES_ON_DEFAULT_FACTORY)[number];

export const APPLIES_ON_UNION_FACTORY = ['factory', 'named_factory', 'union_factory'] as const;
export type AppliesOnUnionFactory = (typeof APPLIES_ON_UNION_FACTORY)[number];

export const APPLIES_ON_MERGED_FACTORY = ['factory', 'named_factory', 'merged_factory'] as const;
export type AppliesOnMergedFactory = (typeof APPLIES_ON_MERGED_FACTORY)[number];

export type AppliesOnNamedFactory = AppliesOnUnionFactory | AppliesOnMergedFactory;

export const APPLIES_ON_FACTORY = [
  'factory',
  'default_factory',
  'named_factory',
  'merged_factory',
  'union_factory',
];
export type AppliesOnFactory = AppliesOnDefaultFactory | AppliesOnNamedFactory;

export const APPLIES_ON_DEFAULT_FACTORY_PARAMETERS = [
  'parameter',
  'default_factory_parameter',
] as const;
export type AppliesOnDefaultFactoryParameters =
  (typeof APPLIES_ON_DEFAULT_FACTORY_PARAMETERS)[number];

export const APPLIES_ON_UNION_FACTORY_PARAMETERS = [
  'parameter',
  'named_factory_parameter',
  'union_factory_parameter',
] as const;
export type AppliesOnUnionFactoryParameters = (typeof APPLIES_ON_UNION_FACTORY_PARAMETERS)[number];

export const APPLIES_ON_MERGED_FACTORY_PARAMETERS = [
  'parameter',
  'named_factory_parameter',
  'merged_factory_parameter',
] as const;
export type AppliesOnMergedFactoryParameters =
  (typeof APPLIES_ON_MERGED_FACTORY_PARAMETERS)[number];

export type AppliesOnNamedParameters =
  | AppliesOnUnionFactoryParameters
  | AppliesOnMergedFactoryParameters;

export const APPLIES_ON_PARAMETERS = [
  'parameter',
  'default_factory_parameter',
  'named_factory_parameter',
  'union_factory_parameter',
  'merged_factory_parameter',
] as const;
export type AppliesOnParameters = AppliesOnDefaultFactoryParameters | AppliesOnNamedParameters;

export const APPLIES_ON_ALL_BLOCKS = [
  'enum',
  'enum_value',
  'class',
  'factory',
  'parameter',
] as const;

export type DartIdentifierCasing = 'snake_case' | 'camelCase' | 'PascalCase';

export type NodeType =
  | ObjectTypeDefinitionNode
  | InputObjectTypeDefinitionNode
  | UnionTypeDefinitionNode
  | EnumTypeDefinitionNode;

export type FieldType = FieldDefinitionNode | InputValueDefinitionNode;

export type ObjectType = ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode;

export type ConfigOption = keyof FlutterFreezedPluginConfig;
export type FreezedOption = Extract<
  ConfigOption,
  | 'copyWith'
  | 'equal'
  | 'immutable'
  | 'makeCollectionsUnmodifiable'
  | 'mutableInputs'
  | 'privateEmptyConstructor'
>;

export type TypeFieldNameOption = Extract<
  ConfigOption,
  'defaultValues' | 'deprecated' | 'escapeDartKeywords' | 'final' | 'fromJsonToJson'
>;

export type MultiConstructorOption = FlutterFreezedPluginConfig['unionClass'];

export type UnionValueCase = 'FreezedUnionCase.camel' | 'FreezedUnionCase.pascal';

/**
 * maps GraphQL scalar types to Dart's scalar types
 */
export const DART_SCALARS: Record<string, string> = {
  ID: 'String',
  String: 'String',
  Boolean: 'bool',
  Int: 'int',
  Float: 'double',
  DateTime: 'DateTime',
};

export const DART_KEYWORDS = {
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
};

/** initializes a FreezedPluginConfig with the defaults values */
export const defaultFreezedPluginConfig: FlutterFreezedPluginConfig = {
  camelCasedEnums: true,
  copyWith: undefined,
  customScalars: {},
  defaultValues: undefined,
  deprecated: undefined,
  equal: undefined,
  escapeDartKeywords: true,
  final: undefined,
  // fromJsonToJson: true, // TODO: @next-version
  ignoreTypes: undefined,
  immutable: true,
  makeCollectionsUnmodifiable: undefined,
  mergeTypes: undefined,
  mutableInputs: true,
  privateEmptyConstructor: true,
  unionClass: undefined,
};

//#endregion
