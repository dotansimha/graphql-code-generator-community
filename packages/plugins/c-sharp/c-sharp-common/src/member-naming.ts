import { camelCase, pascalCase } from 'change-case-all';
import { NameNode } from 'graphql';

/**
 * @description Configuration for member naming conventions.
 */
export type MemberNameConventionConfig = {
  memberNameConvention?: 'camelCase' | 'pascalCase';
};

type MemberNamingFunctionInput = string | NameNode;
/**
 * @description Type func signature of a function is responsible for transforming the name of a member (property, method) to a valid C# identifier.
 */
export type MemberNamingFn = (nameOrNameNode: MemberNamingFunctionInput) => string;

/**
 * @description Get the member naming function based on the provided configuration.
 * @param rawConfig Config to decide which concrete naming function to return. Fallback to camelCase if not provided.
 * @returns
 */
export function getMemberNamingFunction(rawConfig: MemberNameConventionConfig): MemberNamingFn {
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
