import { OperationDefinitionNode } from 'graphql';

export function generateQueryVariablesSignature(
  hasRequiredVariables: boolean,
  operationVariablesTypes: string
): string {
  return `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
}

function generateInfiniteRootQueryKey(node: OperationDefinitionNode) {
  return `'${node.name.value}.infinite'`;
}

function generateInfiniteRootQueryKeyReference(operationName: string) {
  return `useInfinite${operationName}.rootKey`;
}

export function generateInfiniteQueryRootKeyMaker(node: OperationDefinitionNode, operationName: string) {
  return `\nuseInfinite${operationName}.rootKey = ${generateInfiniteRootQueryKey(node)}`;
}

export function generateInfiniteQueryKey(operationName: string, hasRequiredVariables: boolean): string {
  const rootQueryKey = generateInfiniteRootQueryKeyReference(operationName);
  if (hasRequiredVariables) return `[${rootQueryKey}, variables]`;
  return `variables === undefined ? [${rootQueryKey}] : [${rootQueryKey}, variables]`;
}

export function generateInfiniteQueryKeyMaker(
  operationName: string,
  operationVariablesTypes: string,
  hasRequiredVariables: boolean
) {
  const signature = generateQueryVariablesSignature(hasRequiredVariables, operationVariablesTypes);
  return `\nuseInfinite${operationName}.getKey = (${signature}) => ${generateInfiniteQueryKey(
    operationName,
    hasRequiredVariables
  )}`;
}

function generateRootQueryKey(node: OperationDefinitionNode) {
  return `'${node.name.value}'`;
}

function generateRootQueryKeyReference(operationName: string) {
  return `use${operationName}.rootKey`;
}

export function generateQueryRootKeyMaker(node: OperationDefinitionNode, operationName: string) {
  return `\nuse${operationName}.rootKey = ${generateRootQueryKey(node)}`;
}

export function generateQueryKey(operationName: string, hasRequiredVariables: boolean): string {
  const rootQueryKey = generateRootQueryKeyReference(operationName);
  if (hasRequiredVariables) return `[${rootQueryKey}, variables]`;
  return `variables === undefined ? [${rootQueryKey}] : [${rootQueryKey}, variables]`;
}

export function generateQueryKeyMaker(
  node: OperationDefinitionNode,
  operationName: string,
  operationVariablesTypes: string,
  hasRequiredVariables: boolean
) {
  const signature = generateQueryVariablesSignature(hasRequiredVariables, operationVariablesTypes);
  return `\nuse${operationName}.getKey = (${signature}) => ${generateQueryKey(operationName, hasRequiredVariables)}`;
}

export function generateMutationKey(node: OperationDefinitionNode): string {
  return `['${node.name.value}']`;
}

export function generateMutationKeyMaker(node: OperationDefinitionNode, operationName: string) {
  return `\nuse${operationName}.getKey = () => ${generateMutationKey(node)}`;
}
