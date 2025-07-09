export type JsonAttributesSource = 'Newtonsoft.Json' | 'System.Text.Json';

function unsupportedSource(attributesSource: JsonAttributesSource): void {
  throw new Error(`Unsupported JSON attributes source: ${attributesSource}`);
}

type JsonAttributeEnumConfiguration = {
  decorator: string;
  enumMemberAttribute: (value: string) => string;
};

export class JsonAttributesSourceConfiguration {
  readonly namespace: string;
  readonly propertyAttribute: string;
  readonly requiredAttribute: string;
  readonly enumConfiguration: JsonAttributeEnumConfiguration;

  constructor(
    namespace: string,
    propertyAttribute: string,
    requiredAttribute: string,
    enumConfig: JsonAttributeEnumConfiguration,
  ) {
    this.namespace = namespace;
    this.propertyAttribute = propertyAttribute;
    this.requiredAttribute = requiredAttribute;
    this.enumConfiguration = enumConfig;
  }
}

const newtonsoftConfiguration = new JsonAttributesSourceConfiguration(
  'Newtonsoft.Json',
  'JsonProperty',
  'JsonRequired',
  {
    decorator:
      '[System.Runtime.Serialization.DataContract]\n[JsonConverter(typeof(Newtonsoft.Json.Converters.StringEnumConverter))]',
    enumMemberAttribute: value => `[System.Runtime.Serialization.EnumMember(Value = "${value}")]`,
  },
);

// System.Text.Json does not have support of `JsonRequired` alternative (as for .NET 5)
const systemTextJsonConfiguration = new JsonAttributesSourceConfiguration(
  'System.Text.Json.Serialization',
  'JsonPropertyName',
  null,
  {
    enumMemberAttribute: value => `[JsonStringEnumMemberName("${value}")]`,
    decorator: '[JsonConverter(typeof(JsonStringEnumConverter))]',
  },
);

export function getJsonAttributeSourceConfiguration(attributesSource: JsonAttributesSource) {
  switch (attributesSource) {
    case 'Newtonsoft.Json':
      return newtonsoftConfiguration;
    case 'System.Text.Json':
      return systemTextJsonConfiguration;
  }
  unsupportedSource(attributesSource);
}
