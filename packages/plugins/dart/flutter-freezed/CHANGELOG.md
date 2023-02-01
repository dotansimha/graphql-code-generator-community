# @graphql-codegen/flutter-freezed

## 3.0.2

### Patch Changes

- [#72](https://github.com/dotansimha/graphql-code-generator-community/pull/72) [`c70b4ce49`](https://github.com/dotansimha/graphql-code-generator-community/commit/c70b4ce4967db700266a64d514b8c787e7c0cf9a) Thanks [@MitkoTschimev](https://github.com/MitkoTschimev)! - missing trailing comma in enums
  Before
  ```dart
  enum AssetOrder {
    @JsonKey(name: 'contentType_ASC')
    contentTypeAsc
    @JsonKey(name: 'contentType_DESC')
    contentTypeDesc
  }
  ```
  Now
  ```dart
  enum AssetOrder {
    @JsonKey(name: 'contentType_ASC')
    contentTypeAsc,
    @JsonKey(name: 'contentType_DESC')
    contentTypeDesc,
  }
  ```

## 3.0.1

### Patch Changes

- [#74](https://github.com/dotansimha/graphql-code-generator-community/pull/74) [`349dc3a58`](https://github.com/dotansimha/graphql-code-generator-community/commit/349dc3a58bd7822cef984614d4282fa9d90e74be) Thanks [@Parables](https://github.com/Parables)! - docs(plugin config): :memo: updated plugin-config

  added @type decorators, added missing TypeName and FieldName variables in the exampleMarkdowns

  Breaking: mergeTypes signature changed to mergeTypes?: Record<string, TypeName[]>
  Even though the key is a string, we recommend that you use the value of a TypeName.

  Example:

  ```ts filename='codegen.ts'
  import type { CodegenConfig } from '@graphql-codegen/cli';

  const Movie = TypeName.fromString('Movie');
  const CreateMovieInput = TypeName.fromString('CreateMovieInput');
  const UpdateMovieInput = TypeName.fromString('UpdateMovieInput');
  const UpsertMovieInput = TypeName.fromString('UpsertMovieInput');

  const config: CodegenConfig = {
    generates: {
      'lib/data/models/app_models.dart': {
        plugins: {
          'flutter-freezed': {
            mergeTypes: {
              [Movie.value]: [CreateMovieInput, UpdateMovieInput, UpsertMovieInput],
            },
          },
        },
      },
    },
  };
  export default config;
  ```

## 3.0.0

### Major Changes

- [#47](https://github.com/dotansimha/graphql-code-generator-community/pull/47) [`f56200632`](https://github.com/dotansimha/graphql-code-generator-community/commit/f56200632b974be64b0c41c947620d46500ad9c3) Thanks [@Parables](https://github.com/Parables)! - # Configuring the plugin using patterns

  ## What has changed

  The following type definitions have been removed:

  - CustomDecorator = Record<string, DecoratorToFreezed>;

  - DecoratorToFreezed

    - arguments?: string[];
    - applyOn: ApplyDecoratorOn[];
    - mapsToFreezedAs: '@Default' | '@deprecated' | 'final' | 'directive' | 'custom';

  - FieldConfig

    - final?: boolean;
    - deprecated?: boolean;
    - defaultValue?: any;
    - customDecorators?: CustomDecorator;

  - FreezedConfig

    - alwaysUseJsonKeyName?: boolean;
    - copyWith?: boolean;
    - customDecorators?: CustomDecorator;
    - defaultUnionConstructor?: boolean;
    - equal?: boolean;
    - fromJsonToJson?: boolean;
    - immutable?: boolean;
    - makeCollectionsUnmodifiable?: boolean;
    - mergeInputs?: string[];
    - mutableInputs?: boolean;
    - privateEmptyConstructor?: boolean;
    - unionKey?: string;
    - unionValueCase?: 'FreezedUnionCase.camel' | 'FreezedUnionCase.pascal';

  - TypeSpecificFreezedConfig

    - deprecated?: boolean;
    - config?: FreezedConfig;
    - fields?: Record<string, FieldConfig>;

  - FlutterFreezedPluginConfig:
    - fileName?: string;
    - globalFreezedConfig?: FreezedConfig
    - typeSpecificFreezedConfig?: Record<string, TypeSpecificFreezedConfig>;

  ## Why those type definitions were removed

  The previous version allow you to configure GraphQL Types and its fields globally using the `globalFreezedConfig` and override the global configuration with specific ones of each GraphQL Type using the `typeSpecificFreezedConfig`.

  This resulted in a bloated configuration file with duplicated configuration for the same options but for different cases.

  To emphasize on the problem, consider the before and after configurations below:

  Before:

  ```ts
  {
    globalFreezedConfig: {
      immutable: true,
    },
    typeSpecificFreezedConfig: {
      Starship: {
        deprecated: true,
      },
      Droid: {
        config: {
          immutable: false,
        },
        fields: {
          id: {
            deprecated: true,
          },
        },
      },
    },
  };
  ```

  After:

  ```ts

  {
        immutable: TypeNamePattern.forAllTypeNamesExcludeTypeNames([Droid]),
        deprecated: [
          [TypeNamePattern.forTypeNames([Starship]), ['default_factory']],
          [FieldNamePattern.forFieldNamesOfTypeName([[Droid, id]]), ['default_factory_parameter']],
        ],
      }
  ```

  The 2 configurations above do the same thing, the later being more compact, flexible and readable than the former.

  ## How to update your existing configuration

  First understand the [usage of the Patterns](https://the-guild.dev/graphql/codegen/docs/guides/flutter-freezed#configuring-the-plugin), then create a new config file(preferably a typescript file: previous version of the code generator used a YAML file).
  And implement the new configuration one by one inspecting the generated output.

  > Please avoid migrating all your configuration at once. Doing that means you wont be able to inspect the generated output and ensure that the expected results are produced.

## 2.11.2

### Patch Changes

- [#8525](https://github.com/dotansimha/graphql-code-generator/pull/8525) [`63dc8f205`](https://github.com/dotansimha/graphql-code-generator/commit/63dc8f2054e27b944f7d8dc59db8afa85760a127) Thanks [@charlypoly](https://github.com/charlypoly)! - dependencies updates:
  - Updated dependency [`@graphql-codegen/visitor-plugin-common@2.13.0` ↗︎](https://www.npmjs.com/package/@graphql-codegen/visitor-plugin-common/v/2.13.0) (from `2.12.0`, in `dependencies`)
- Updated dependencies [[`63dc8f205`](https://github.com/dotansimha/graphql-code-generator/commit/63dc8f2054e27b944f7d8dc59db8afa85760a127)]:
  - @graphql-codegen/visitor-plugin-common@2.13.1
  - @graphql-codegen/plugin-helpers@2.7.2

## 2.11.1

### Patch Changes

- [#8171](https://github.com/dotansimha/graphql-code-generator/pull/8171) [`47f17f0d9`](https://github.com/dotansimha/graphql-code-generator/commit/47f17f0d9a2c4b57221397d3ec7f3882762b9cbe) Thanks [@Parables](https://github.com/Parables)! - Flutter-freezed
