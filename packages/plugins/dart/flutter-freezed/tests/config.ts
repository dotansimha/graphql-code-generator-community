import { FlutterFreezedPluginConfig } from '../src/config';
import { mergeConfig } from '../src/utils';

export const typeConfig: FlutterFreezedPluginConfig = mergeConfig({
  globalFreezedConfig: {
    unionValueCase: 'FreezedUnionCase.camel',
  },
  typeSpecificFreezedConfig: {
    Starship: {
      deprecated: true,
      config: {
        alwaysUseJsonKeyName: true,
        copyWith: false,
        immutable: false,
        unionValueCase: 'FreezedUnionCase.pascal',
      },
    },
  },
});

export const customDecoratorsConfig: FlutterFreezedPluginConfig = mergeConfig({
  globalFreezedConfig: {
    customDecorators: {
      '@JsonSerializable(explicitToJson: true)': {
        applyOn: ['class'],
        mapsToFreezedAs: 'custom',
      },
    },
  },
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
});

export const fullDemoConfig: FlutterFreezedPluginConfig = mergeConfig({
  customScalars: {
    jsonb: 'Map<String, dynamic>',
    timestamptz: 'DateTime',
    UUID: 'String',
  },
  globalFreezedConfig: {
    mergeInputs: ['Create$Input', 'Upsert$Input', 'Delete$Input'],
    customDecorators: {
      '@JsonSerializable(explicitToJson: true)': {
        applyOn: ['class'],
        mapsToFreezedAs: 'custom',
      },
    },
  },
  typeSpecificFreezedConfig: {
    Base: {
      config: {
        mergeInputs: ['$AInput', '$BInput', 'BaseCInput', 'CreateMovieInput'],
      },
    },
    Starship: {
      config: {
        alwaysUseJsonKeyName: true,
        copyWith: false,
        equal: false,
        privateEmptyConstructor: false,
        unionValueCase: 'FreezedUnionCase.pascal',
      },
    },
    Droid: {
      config: {
        immutable: false,
        fromJsonToJson: false,
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
});
