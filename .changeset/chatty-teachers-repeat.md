---
'@graphql-codegen/flutter-freezed': major
---

# Configuring the plugin using patterns

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

First understand the [usage of the Patterns](https://the-guild.dev/graphql/codegen/docs/guides/flutter-freezed), then create a new config file(preferably a typescript file: previous version of the code generator used a YAML file).
And implement the new configuration one by one inspecting the generated output.
Please avoid migrating all your configuration at once.Doing that means you wont be able to inspect the generated output and ensure that the expected results are produced.
