import { camelCase, pascalCase } from 'change-case-all';
import { NameNode } from 'graphql';
import { CSharpResolversPluginRawConfig } from './config';

type FieldNamingFunctionInput = string | NameNode;

export type FieldNamingFunction = (nameOrNameNode: FieldNamingFunctionInput) => string;

export function getFieldNamingFunction(
  rawConfig: CSharpResolversPluginRawConfig,
): FieldNamingFunction {
  switch (rawConfig.fieldNameConvention) {
    case 'camelCase':
      return (input: FieldNamingFunctionInput) =>
        camelCase(typeof input === 'string' ? input : input.value);
    case 'pascalCase':
      return (input: FieldNamingFunctionInput) =>
        pascalCase(typeof input === 'string' ? input : input.value);
    default:
      return (input: FieldNamingFunctionInput) =>
        camelCase(typeof input === 'string' ? input : input.value);
  }
}
