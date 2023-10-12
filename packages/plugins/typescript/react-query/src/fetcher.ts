import autoBind from 'auto-bind';
import { OperationDefinitionNode } from 'graphql';
import { ReactQueryVisitor } from './visitor.js';

export class BaseFetcherRenderer {
  constructor(protected visitor: ReactQueryVisitor) {
    autoBind(this);
  }

  generateQueryHelper() {}

  generateQueryVariablesSignature(
    hasRequiredVariables: boolean,
    operationVariablesTypes: string,
  ): string {
    return `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
  }

  generateInfiniteQueryVariablesSignature(
    hasRequiredVariables: boolean,
    operationVariablesTypes: string,
  ): string {
    if (this.visitor.config.reactQueryVersion <= 4) {
      return `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
    }
    return `variables: ${operationVariablesTypes}`;
  }

  generateInfiniteQueryOptionsSignature(
    infiniteQueryOptions: string,
    operationResultType: string,
  ): string {
    if (this.visitor.config.reactQueryVersion <= 4) {
      return `options?: ${infiniteQueryOptions}<${operationResultType}, TError, TData>`;
    }
    return `options: Omit<${infiniteQueryOptions}<${operationResultType}, TError, TData>, 'queryKey'> & { queryKey?: ${infiniteQueryOptions}<${operationResultType}, TError, TData>['queryKey'] }`;
  }

  generateInfiniteQueryKey(node: OperationDefinitionNode, hasRequiredVariables: boolean): string {
    if (hasRequiredVariables) return `['${node.name.value}.infinite', variables]`;
    return `variables === undefined ? ['${node.name.value}.infinite'] : ['${node.name.value}.infinite', variables]`;
  }

  generateInfiniteQueryKeyMaker(
    node: OperationDefinitionNode,
    operationName: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ) {
    const signature = this.generateQueryVariablesSignature(
      hasRequiredVariables,
      operationVariablesTypes,
    );
    return `\nuseInfinite${operationName}.getKey = (${signature}) => ${this.generateInfiniteQueryKey(
      node,
      hasRequiredVariables,
    )};\n`;
  }

  generateInfiniteQueryRootKeyMaker(node: OperationDefinitionNode, operationName: string) {
    return `\nuseInfinite${operationName}.rootKey = '${node.name.value}.infinite';\n`;
  }

  generateQueryKey(node: OperationDefinitionNode, hasRequiredVariables: boolean): string {
    if (hasRequiredVariables) return `['${node.name.value}', variables]`;
    return `variables === undefined ? ['${node.name.value}'] : ['${node.name.value}', variables]`;
  }

  generateQueryKeyMaker(
    node: OperationDefinitionNode,
    operationName: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ) {
    const signature = this.generateQueryVariablesSignature(
      hasRequiredVariables,
      operationVariablesTypes,
    );
    return `\nuse${operationName}.getKey = (${signature}) => ${this.generateQueryKey(
      node,
      hasRequiredVariables,
    )};\n`;
  }

  generateQueryRootKeyMaker(node: OperationDefinitionNode, operationName: string) {
    return `\nuse${operationName}.rootKey = '${node.name.value}';\n`;
  }

  generateMutationKey(node: OperationDefinitionNode): string {
    return `['${node.name.value}']`;
  }

  generateMutationKeyMaker(node: OperationDefinitionNode, operationName: string) {
    return `\nuse${operationName}.getKey = () => ${this.generateMutationKey(node)};\n`;
  }

  generateInfiniteQueryRequired() {
    if (this.visitor.config.reactQueryVersion <= 4) {
      return '?';
    }
    return '';
  }

  generateInfiniteQueryFormattedParameters(queryKey: string, queryFn: string) {
    if (this.visitor.config.reactQueryVersion <= 4) {
      return `${queryKey},
      ${queryFn},
      options`;
    }
    return `(() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ${queryKey},
      queryFn: ${queryFn},
      ...restOptions
    }
  })()`;
  }

  generateQueryFormattedParameters(queryKey: string, queryFn: string): string {
    if (this.visitor.config.reactQueryVersion <= 4) {
      return `${queryKey},
      ${queryFn},
      options`;
    }
    return `{
    queryKey: ${queryKey},
    queryFn: ${queryFn},
    ...options
  }`;
  }

  generateMutationFormattedParameters(mutationKey: string, mutationFn: string): string {
    if (this.visitor.config.reactQueryVersion <= 4) {
      return `${mutationKey},
      ${mutationFn},
      options`;
    }
    return `{
    mutationKey: ${mutationKey},
    mutationFn: ${mutationFn},
    ...options
  }`;
  }
}
export abstract class FetcherRenderer extends BaseFetcherRenderer {
  abstract generateFetcherImplementation(): string;
  abstract generateQueryHook(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string;
  abstract generateInfiniteQueryHook(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string;
  abstract generateMutationHook(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string;
  abstract generateFetcherFetch(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string;
}
