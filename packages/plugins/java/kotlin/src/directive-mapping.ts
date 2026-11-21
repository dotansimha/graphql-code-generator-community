/**
 * GraphQL validation directives to Jakarta Validation annotations mapping
 */

export interface DirectiveArgument {
  name: string;
  value: string;
}

export const VALIDATION_DIRECTIVES: Record<string, string> = {
  '@notBlank': 'NotBlank',
  '@size': 'Size',
  '@email': 'Email',
  '@pattern': 'Pattern',
  '@positive': 'Positive',
  '@future': 'Future',
  '@past': 'Past',
  '@min': 'Min',
  '@max': 'Max',
  '@notNull': 'NotNull',
  '@null': 'Null',
  '@assertTrue': 'AssertTrue',
  '@assertFalse': 'AssertFalse',
  '@negative': 'Negative',
  '@negativeOrZero': 'NegativeOrZero',
  '@positiveOrZero': 'PositiveOrZero',
  '@decimalMin': 'DecimalMin',
  '@decimalMax': 'DecimalMax',
  '@digits': 'Digits'
};

/**
 * Validation directive parameter mapping
 */
export const VALIDATION_PARAM_MAPPING: Record<string, Record<string, string>> = {
  '@size': {
    'min': 'min',
    'max': 'max',
    'message': 'message'
  },
  '@pattern': {
    'regexp': 'regexp',
    'message': 'message'
  },
  '@min': {
    'value': 'value',
    'message': 'message'
  },
  '@max': {
    'value': 'value',
    'message': 'message'
  },
  '@decimalMin': {
    'value': 'value',
    'message': 'message'
  },
  '@decimalMax': {
    'value': 'value',
    'message': 'message'
  },
  '@digits': {
    'integer': 'integer',
    'fraction': 'fraction',
    'message': 'message'
  }
};

/**
 * Parse GraphQL directive arguments
 */
export function parseDirectiveArgs(
  directiveName: string,
  args: any[]
): DirectiveArgument[] {
  const paramMapping = VALIDATION_PARAM_MAPPING[directiveName] || {};
  return args.map(arg => {
    const argName = arg.name.value;
    const mappedArgName = paramMapping[argName] || argName;
    const value = formatArgValue(arg.value);
    return {
      name: mappedArgName,
      value: value
    };
  });
}

/**
 * Format argument values
 */
function formatArgValue(value: any): string {
  switch (value.kind) {
    case 'StringValue':
      // Escape backslashes in string values
      return `"${value.value.replace(/\\/g, '\\')}"`;
    case 'IntValue':
    case 'FloatValue':
    case 'BooleanValue':
      return value.value;
    default:
      // Escape backslashes in string values for default case
      return `"${value.value.replace(/\\/g, '\\')}"`;
  }
}

/**
 * Check if directive is a validation directive
 */
export function isValidationDirective(directiveName: string): boolean {
  return VALIDATION_DIRECTIVES.hasOwnProperty(`@${directiveName}`);
}