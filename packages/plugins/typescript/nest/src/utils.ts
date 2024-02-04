import { DecoratorOptions, Type } from './types.js';

export const isDefinitionInterface = definition => definition.includes('@Nest.InterfaceType()');

export const escapeString = (str: string) =>
  "'" +
  String(str || '')
    .replace(/\\/g, '\\\\')
    // eslint-disable-next-line no-useless-escape
    .replace(/'/g, "'") +
  "'";

export const formatDecoratorOptions = (options: DecoratorOptions, isFirstArgument = true) => {
  if (!Object.keys(options).length) {
    return '';
  }

  return (
    (isFirstArgument ? '' : ', ') +
    ('{ ' +
      Object.entries(options)
        .map(([key, value]) => `${key}: ${JSON.stringify(value).replace(/"/g, '')}`)
        .join(', ') +
      ' }')
  );
};

export const buildTypeString = (type: Type): string => {
  if (!type.isArray && !type.isScalar && !type.isNullable) {
    type.type = `FixDecorator<${type.type}>`;
  }
  if (type.isScalar) {
    type.type = `Scalars['${type.type}']`;
  }
  if (type.isArray) {
    type.type = `Array<${type.type}>`;
  }
  if (type.isNullable) {
    type.type = `Maybe<${type.type}>`;
  }

  return type.type;
};

export const fixDecorator = (type: Type, typeString: string): string => {
  return type.isArray || type.isNullable || type.isScalar
    ? typeString
    : `FixDecorator<${typeString}>`;
};

export const getNestNullableValue = (type: Type): string => {
  if (type.isNullable) {
    if (type.isItemsNullable) {
      return "'itemsAndList'";
    }
    return 'true';
  }
  if (type.isItemsNullable) {
    return "'items'";
  }

  return undefined;
};
