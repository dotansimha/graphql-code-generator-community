import { camelCase, pascalCase } from 'change-case-all';
import { NameNode } from 'graphql';
import { CSharpResolversPluginRawConfig } from '../../c-sharp/src/config';

type MemberNamingFunctionInput = string | NameNode;

export type MemberNamingFn = (nameOrNameNode: MemberNamingFunctionInput) => string;

export function getMemberNamingFunction(rawConfig: CSharpResolversPluginRawConfig): MemberNamingFn {
  switch (rawConfig.memberNameConvention) {
    case 'camelCase':
      return (input: MemberNamingFunctionInput) =>
        camelCase(typeof input === 'string' ? input : input.value);
    case 'pascalCase':
      return (input: MemberNamingFunctionInput) =>
        pascalCase(typeof input === 'string' ? input : input.value);
    default:
      return (input: MemberNamingFunctionInput) =>
        camelCase(typeof input === 'string' ? input : input.value);
  }
}
