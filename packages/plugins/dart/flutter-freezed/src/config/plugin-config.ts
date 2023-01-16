import {
  ObjectTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  UnionTypeDefinitionNode,
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
} from 'graphql';
import { TypeNamePattern, TypeName, FieldNamePattern, Pattern } from './pattern';

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
   * @see {@link url Dart Lint on Enum casing}
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
   * @see {@link url Freezed copyWith helper method usage}
   * @see {@link url TypeNamePattern}
   * @summary enables Freezed copyWith helper method
   * @description The [`freezed`](url) library has this option enabled by default.
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
   * @type {([pattern: FieldNamePattern, value: string, appliesOn: AppliesOnParameters[], directiveName?: string, directiveArgName?: string][])}
   * @default undefined
   * @summary set the default value for a field.
   * @description This will annotate the generated parameter with a `@Default(value: defaultValue)` decorator.
   *
   *  Use backticks for the values if you want to use the quotation marks for string values.
   *
   * Use the `appliesOn` to specify where this option should be applied on
   *
   * If the `directiveName` and `directiveArgName` are passed, the value of the argument of the given directive specified in the Graphql Schema will be used as the defaultValue
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
   *           defaultValues: [
   *             [FieldNamePattern.forFieldNamesOfTypeName(MovieCharacter, appearsIn), `Episode.jedi`, ['default_factory_parameter']],
   *             // default value from directive. See Graphql Constraints: url
   *             [FieldNamePattern.forFieldNamesOfAllTypeNames([age]), `18`, ['parameter'], 'constraint', min],
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
    appliesOn: AppliesOnParameters[]
  ][];

  /**
   * @name deprecated
   * @type {([pattern: Pattern, appliesOn: (AppliesOnFactory | AppliesOnParameters)[]][])}
   * @default undefined
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
   * @see {@link url Freezed equal helper method usage}
   * @see {@link url TypeNamePattern}
   * @summary enables Freezed equal helper method
   * @description The [`freezed`](url) library has this option enabled by default.
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
   * @default true
   * @see_also [dartKeywordEscapePrefix,dartKeywordEscapeSuffix]
   * @summary ensures that the generated Freezed models doesn't use any of Dart's reserved keywords as identifiers
   * @description Wraps the fields names that are valid Dart keywords with the prefix and suffix given and allows you to specify your preferred casing: "snake_case" | "camelCase" | "PascalCase"
   *
   *
   * @exampleMarkdown
   * ## Usage:
   *
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
   *           // WARNING: Setting this option to `false` might generate output that contains Dart keywords as identifiers. Defaults to `true`
   *           escapeDartKeywords: false,
   *           // OR configure how Dart keywords are handled for each type
   *           escapeDartKeywords: [
   *             [
   *               'Episode.@*FieldNames',
   *               // `prefix`: defaults to an empty string `''` if undefined.
   *               // Note that using a underscore `_` as a prefix will make the field as private
   *               undefined,
   *               // `suffix`: defaults to an underscore `_` if undefined
   *               undefined,
   *               // `casing`: maintains the original casing if undefined.
   *               // Available options: `snake_cased`, `camelCase` or `PascalCase`
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
  escapeDartKeywords?: boolean | [pattern: Pattern, prefix?: string, suffix?: string, appliesOn?: AppliesOn[]][];

  /**
   * @name final
   * @summary  marks fields as final
   * @description This will mark the specified parameters as final
   *
   *   Requires a an array of tuples with the type signature below:
   *
   * ` [typeFieldName: TypeFieldName, appliesOn: AppliesOnParameters[]]`
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
   *           final: [
   *             ['Human.[name]', ['parameter']],
   *             ['Starship.[id],Droid.[id],Human.[id]', ['default_factory_parameter']],
   *           ],
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
   *
   * @name fromJsonToJson
   * @summary  makes your models compatible with `json_serializable`.
   * @description If `true` freezed will use `json_serializable` to generate fromJson and toJson constructors for your models.
   *
   * You can use custom encodings for each field by passing in an array of tuple with the type signature below:
   *
   * `[typeFieldName: TypeFieldName, classOrFunctionName: string, useClassConverter?: boolean, appliesOn?: AppliesOnParameters[]]`
   * @see {@link https://github.com/google/json_serializable.dart/tree/master/json_serializable#custom-types-and-custom-encoding Custom types and custom encoding}
   * @default true
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
   *           fromJsonToJson: [
   *             // Example 1: Using functionName
   *             ['Movie.[createdAt,updatedAt]', timestamp, false, ['parameter']],
   *             // Example 2: Using className
   *             ['Movie.[createdAt,updatedAt]', Timestamp, true, ['parameter']],
   *           ],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   *
   * ### Example 1: using `functionName`
   *
   * This will declare two functions with a name `timestampFromJson` and `timestampToJson` that will an throw an Exception. You will need to implement the function manually.
   *
   * ```dart filename="app_models.dart"
   * dynamic timestampFromJson(dynamic val) {
   * throw Exception("You must implement `timestampToJson` function in `app_models.dart`");
   * }
   *
   * dynamic timestampToJson(dynamic val) {
   * throw Exception("You must implement `timestampToJson` function in `app_models.dart`");
   * }
   * ```
   *
   * ### Example 2: suing `className`
   *
   * Like the `functionName`, this will rather place the functions as methods in a class using the name given.
   *
   * This provides a better abstraction than the global functions. That's why `className` has a higher precedence than `functionName`
   *
   * ```dart filename="app_models.dart"
   * class TimestampConvertor implements JsonConverter<dynamic, dynamic> {
   *     const TimestampConvertor();
   *
   *     @override
   *     dynamic fromJson(dynamic json){
   *         throw Exception("You must implement `TimestampConvertor.fromJson` method in `app_models.dart`");
   *     }
   *
   *     @override
   *     dynamic toJson(dynamic object){
   *         throw Exception("You must implement `TimestampConvertor.toJson` method in `app_models.dart`");
   *     }
   * }
   * ```
   */
  /* fromJsonToJson?: // TODO: @next-version
    | boolean
    | TypeNamePattern
    | [
        pattern: FieldNamePattern,
        classOrFunctionName: string,
        useClassConverter?: boolean,
        appliesOn?: AppliesOnParameters[]
      ][]; */

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
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           ignoreTypes: ['PaginatorInfo'],
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
   * @see {@link url Freezed immutable helper method usage}
   * @see {@link url TypeNamePattern}
   * @summary enables Freezed immutable helper method
   * @description  set to true to use the `@freezed` decorator or false to use the `@unfreezed` decorator
   * @description The [`freezed`](url) library  by default generates immutable models decorated with the `@freezed` decorator.
   * This option if set to `false` the plugin will generate mutable Freezed models using the `@unfreezed` decorator instead.
   *
   * Setting a boolean value will enable/disable this option globally for every GraphQL Type
   * but you can also set this option to `true` for one or more GraphQL Types using a `TypeNamePattern`.
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
   * @description allows collections(lists/maps) to be modified even if class is immutable
   * @default undefined
   *
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
   *           makeCollectionsUnmodifiable: true,
   *           // OR: a comma-separated string
   *           makeCollectionsUnmodifiable: 'Droid,Starship',
   *           // OR: a list of GRaphQL Type names
   *           makeCollectionsUnmodifiable: ['Droid', 'Starship'],
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
   * @default undefined
   * @description merges other GraphQL Types as a named factory constructor inside a class generated for the target GraphQL ObjectType.
   * This option takes an array of strings that are expected to be valid typeNames of GraphQL Types to be merged with the GraphQL Type used as the key.
   * The array is mapped and each string is converted into a TypeName so please ensure that the strings are valid GraphQL TypeNames
   * A string that contains any invalid characters will throw an exception.
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *      mergeTypes: ["Create$Input", "Update$Input", "Delete$Input"]
   * ```
   */
  mergeTypes?: Record<string, string[]>;

  /**
   * @name mutableInputs
   * @description  since inputs will be used to collect data, it makes sense to make them mutable with Freezed's `@unfreezed` decorator. This overrides(in order words: has a higher precedence than) the `immutable` config value `ONLY` for GraphQL `input types`.
   * @default true
   *
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
   *           mutableInputs: true,
   *           // OR: a comma-separated string
   *           mutableInputs: 'Droid,Starship',
   *           // OR: a list of GRaphQL Type names
   *           mutableInputs: ['Droid', 'Starship'],
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
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           privateEmptyConstructor: true,
   *           // OR: a comma-separated string
   *           privateEmptyConstructor: 'Droid,Starship',
   *           // OR: a list of GRaphQL Type names
   *           privateEmptyConstructor: ['Droid', 'Starship'],
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
    unionValuesNameMap?: [typeName: TypeName, unionValueKey: string][]
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

export const APPLIES_ON_ENUM = <const>['enum'];
export type AppliesOnEnum = typeof APPLIES_ON_ENUM[number];

export const APPLIES_ON_ENUM_VALUE = <const>['enum_value'];
export type AppliesOnEnumValue = typeof APPLIES_ON_ENUM_VALUE[number];

export const APPLIES_ON_CLASS = <const>['class'];
export type AppliesOnClass = typeof APPLIES_ON_CLASS[number];

export const APPLIES_ON_DEFAULT_FACTORY = <const>['factory', 'default_factory'];
export type AppliesOnDefaultFactory = typeof APPLIES_ON_DEFAULT_FACTORY[number];

export const APPLIES_ON_UNION_FACTORY = <const>['factory', 'named_factory', 'union_factory'];
export type AppliesOnUnionFactory = typeof APPLIES_ON_UNION_FACTORY[number];

export const APPLIES_ON_MERGED_FACTORY = <const>['factory', 'named_factory', 'merged_factory'];
export type AppliesOnMergedFactory = typeof APPLIES_ON_MERGED_FACTORY[number];

export type AppliesOnNamedFactory = AppliesOnUnionFactory | AppliesOnMergedFactory;

export const APPLIES_ON_FACTORY = ['factory', 'default_factory', 'named_factory', 'merged_factory', 'union_factory'];
export type AppliesOnFactory = AppliesOnDefaultFactory | AppliesOnNamedFactory;

export const APPLIES_ON_DEFAULT_FACTORY_PARAMETERS = <const>['parameter', 'default_factory_parameter'];
export type AppliesOnDefaultFactoryParameters = typeof APPLIES_ON_DEFAULT_FACTORY_PARAMETERS[number];

export const APPLIES_ON_UNION_FACTORY_PARAMETERS = <const>[
  'parameter',
  'named_factory_parameter',
  'union_factory_parameter',
];
export type AppliesOnUnionFactoryParameters = typeof APPLIES_ON_UNION_FACTORY_PARAMETERS[number];

export const APPLIES_ON_MERGED_FACTORY_PARAMETERS = <const>[
  'parameter',
  'named_factory_parameter',
  'merged_factory_parameter',
];
export type AppliesOnMergedFactoryParameters = typeof APPLIES_ON_MERGED_FACTORY_PARAMETERS[number];

export type AppliesOnNamedParameters = AppliesOnUnionFactoryParameters | AppliesOnMergedFactoryParameters;

export const APPLIES_ON_PARAMETERS = <const>[
  'parameter',
  'default_factory_parameter',
  'named_factory_parameter',
  'union_factory_parameter',
  'merged_factory_parameter',
];
export type AppliesOnParameters = AppliesOnDefaultFactoryParameters | AppliesOnNamedParameters;

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
  'copyWith' | 'equal' | 'immutable' | 'makeCollectionsUnmodifiable' | 'mutableInputs' | 'privateEmptyConstructor'
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
