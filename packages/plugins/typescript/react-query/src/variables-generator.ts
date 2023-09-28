import { OperationDefinitionNode } from 'graphql';

export function generateQueryVariablesSignature(
  hasRequiredVariables: boolean,
  operationVariablesTypes: string,
): string {
  return `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
}

export function generateInfiniteQueryKey(
  node: OperationDefinitionNode,
  hasRequiredVariables: boolean,
): string {
  if (hasRequiredVariables) return `['${node.name.value}.infinite', variables]`;
  return `variables === undefined ? ['${node.name.value}.infinite'] : ['${node.name.value}.infinite', variables]`;
}

export function generateInfiniteQueryKeyMaker(
  node: OperationDefinitionNode,
  operationName: string,
  operationVariablesTypes: string,
  hasRequiredVariables: boolean,
) {
  const signature = generateQueryVariablesSignature(hasRequiredVariables, operationVariablesTypes);
  return `\nuseInfinite${operationName}.getKey = (${signature}) => ${generateInfiniteQueryKey(
    node,
    hasRequiredVariables,
  )};\n`;
}

export function generateInfiniteQueryRootKeyMaker(
  node: OperationDefinitionNode,
  operationName: string,
) {
  return `\nuseInfinite${operationName}.rootKey = '${node.name.value}.infinite';\n`;
}

export function generateQueryKey(
  node: OperationDefinitionNode,
  hasRequiredVariables: boolean,
): string {
  if (hasRequiredVariables) return `['${node.name.value}', variables]`;
  return `variables === undefined ? ['${node.name.value}'] : ['${node.name.value}', variables]`;
}

export function generateQueryKeyMaker(
  node: OperationDefinitionNode,
  operationName: string,
  operationVariablesTypes: string,
  hasRequiredVariables: boolean,
) {
  const signature = generateQueryVariablesSignature(hasRequiredVariables, operationVariablesTypes);
  return `\nuse${operationName}.getKey = (${signature}) => ${generateQueryKey(
    node,
    hasRequiredVariables,
  )};\n`;
}

export function generateQueryRootKeyMaker(node: OperationDefinitionNode, operationName: string) {
  return `\nuse${operationName}.rootKey = '${node.name.value}';\n`;
}

export function generateMutationKey(node: OperationDefinitionNode): string {
  return `['${node.name.value}']`;
}

export function generateMutationKeyMaker(node: OperationDefinitionNode, operationName: string) {
  return `\nuse${operationName}.getKey = () => ${generateMutationKey(node)};\n`;
}

interface GenerateInfiniteQueryFormattedParametersPayload {
  reactQueryVersion: number;
  queryKey: string;
  queryFn: string;
}
export function generateInfiniteQueryFormattedParameters(
  payload: GenerateInfiniteQueryFormattedParametersPayload,
) {
  const { reactQueryVersion, queryKey, queryFn } = payload;
  if (reactQueryVersion <= 4) {
    return `${queryKey},
      ${queryFn},
      options`;
  }
  return `{
    queryKey:${queryKey},
    queryFn:${queryFn},
    ...options
  }`;
}

interface GenerateQueryParametersFormattedPayload {
  reactQueryVersion: number;
  queryKey: string;
  queryFn: string;
}
export function generateQueryFormattedParameters(
  payload: GenerateQueryParametersFormattedPayload,
): string {
  const { reactQueryVersion, queryKey, queryFn } = payload;
  if (reactQueryVersion <= 4) {
    return `${queryKey},
      ${queryFn},
      options`;
  }
  return `{
    queryKey:${queryKey},
    queryFn:${queryFn},
    ...options
  }`;
}

interface GenerateMutationFormattedParametersPayload {
  reactQueryVersion: number;
  mutationKey: string;
  mutationFn: string;
}
export function generateMutationFormattedParameters(
  payload: GenerateMutationFormattedParametersPayload,
): string {
  const { reactQueryVersion, mutationKey, mutationFn } = payload;
  if (reactQueryVersion <= 4) {
    return `${mutationKey},
      ${mutationFn},
      options`;
  }
  return `{
    mutationKey:${mutationKey},
    mutationFn:${mutationFn},
    ...options
  }`;
}
