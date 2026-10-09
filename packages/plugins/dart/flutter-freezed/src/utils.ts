//#region helpers
import { camelCase, pascalCase, snakeCase } from 'change-case-all';
import {
  DefinitionNode,
  InputObjectTypeDefinitionNode,
  Kind,
  ObjectTypeDefinitionNode,
} from 'graphql';
import { Config } from './config/config-value.js';
import { FieldName, TypeName } from './config/pattern.js';
import {
  AppliesOn,
  DART_KEYWORDS,
  DartIdentifierCasing,
  FlutterFreezedPluginConfig,
} from './config/plugin-config.js';

export const strToList = (str: string) =>
  str.length < 1 ? [] : str.split(/\s*,\s*/gim).filter(s => s.length > 0);

export const arrayWrap = <T>(value: T | T[]) =>
  value === undefined ? [] : Array.isArray(value) ? value : ([value] as T[]);

export const resetIndex = (regexp: RegExp) => (regexp.lastIndex = 0);

export const nodeIsObjectType = (
  node: DefinitionNode,
): node is ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode =>
  node.kind === Kind.OBJECT_TYPE_DEFINITION || node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION;

export const appliesOnBlock = <T extends AppliesOn>(
  configAppliesOn: T[],
  blockAppliesOn: readonly T[],
) => configAppliesOn.some(a => blockAppliesOn.includes(a));

export const dartCasing = (name: string, casing?: DartIdentifierCasing): string => {
  if (casing === 'camelCase') {
    return camelCase(name);
  } else if (casing === 'PascalCase') {
    return pascalCase(name);
  } else if (casing === 'snake_case') {
    return snakeCase(name);
  }
  return name;
};
/**
 * checks whether name is a Dart Language keyword
 * @param identifier The name or identifier to be checked
 * @returns `true` if name is a Dart Language keyword, otherwise `false`
 */
export const isDartKeyword = (identifier: string) => DART_KEYWORDS[identifier] !== undefined;

/**
 * Ensures that the blockName isn't a valid Dart language reserved keyword.
 * It wraps the identifier with the prefix and suffix then transforms the casing as specified in the config
 * @param config
 * @param name
 * @param typeName
 * @returns
 */
export const escapeDartKeyword = (
  config: FlutterFreezedPluginConfig,
  blockAppliesOn: readonly AppliesOn[],
  identifier: string,
  typeName?: TypeName,
  fieldName?: FieldName,
): string => {
  if (isDartKeyword(identifier)) {
    const [prefix, suffix] = Config.escapeDartKeywords(config, blockAppliesOn, typeName, fieldName);
    return `${prefix}${identifier}${suffix}`;
  }
  return identifier;
};

// TODO: Add this option to the plugin-config
type JsonKeyOptions = {
  defaultValue?: string;
  disallowNullValue?: boolean;
  fromJson?: string;
  ignore?: boolean;
  includeIfNull?: boolean;
  name?: string;
  // readValue?: string,
  required?: boolean;
  toJson?: string;
  // unknownEnumValue?: string
};
export const atJsonKeyDecorator = ({
  defaultValue,
  disallowNullValue,
  fromJson,
  ignore,
  includeIfNull,
  name,
  required,
  toJson,
}: JsonKeyOptions): string => {
  const body = [
    stringIsNotEmpty(defaultValue) ? `defaultValue: ${defaultValue}` : undefined,
    disallowNullValue ? `disallowNullValue: ${disallowNullValue}` : undefined,
    stringIsNotEmpty(fromJson) ? `fromJson: ${fromJson}` : undefined,
    ignore ? `ignore: ${ignore}` : undefined,
    includeIfNull ? `includeIfNull: ${includeIfNull}` : undefined,
    stringIsNotEmpty(name) ? `name: '${name}'` : undefined,
    required ? `required: ${required}` : undefined,
    stringIsNotEmpty(toJson) ? `toJson: ${toJson}` : undefined,
  ]
    .filter(value => value !== undefined)
    .join(',');

  return stringIsNotEmpty(body) ? `@JsonKey(${body})\n` : '';
};

type JsonValueOptions = {
  value?: string;
};
export const atJsonValueDecorator = ({ value }: JsonValueOptions): string => {
  const body = [stringIsNotEmpty(value) ? `'${value}'` : undefined]
    .filter(value => value !== undefined)
    .join(',');

  return stringIsNotEmpty(body) ? `@JsonValue(${body})\n` : '';
};

export const stringIsNotEmpty = (str: string) => str?.length > 0;

//#endregion
