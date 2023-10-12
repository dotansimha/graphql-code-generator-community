import autoBind from 'auto-bind';
import { OperationDefinitionNode } from 'graphql';
import { FetcherRenderer } from './fetcher.js';
import { ReactQueryVisitor } from './visitor.js';

export class FetchFetcher extends FetcherRenderer {
  constructor(protected visitor: ReactQueryVisitor) {
    super(visitor);
    autoBind(this);
  }

  generateFetcherImplementation(): string {
    return `
function fetcher<TData, TVariables>(endpoint: string, requestInit: RequestInit, query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch(endpoint, {
      method: 'POST',
      ...requestInit,
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0];

      throw new Error(message);
    }

    return json.data;
  }
}`;
  }

  generateInfiniteQueryHook(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string {
    const variables = this.generateInfiniteQueryVariablesSignature(
      hasRequiredVariables,
      operationVariablesTypes,
    );
    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryHookIdentifiersInUse.add(hookConfig.infiniteQuery.hook);
    this.visitor.reactQueryOptionsIdentifiersInUse.add(hookConfig.infiniteQuery.options);

    const options = this.generateInfiniteQueryOptionsSignature(
      hookConfig.infiniteQuery.options,
      operationResultType,
    );

    return `export const useInfinite${operationName} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      ${variables},
      ${options}
    ) =>
    ${hookConfig.infiniteQuery.hook}<${operationResultType}, TError, TData>(
      ${this.generateInfiniteQueryFormattedParameters(
        this.generateInfiniteQueryKey(node, hasRequiredVariables),
        `(metaData) => fetcher<${operationResultType}, ${operationVariablesTypes}>(dataSource.endpoint, dataSource.fetchParams || {}, ${documentVariableName}, {...variables, ...(metaData.pageParam ?? {})})()`,
      )}
    );`;
  }

  generateQueryHook(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string {
    const variables = this.generateQueryVariablesSignature(
      hasRequiredVariables,
      operationVariablesTypes,
    );
    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryHookIdentifiersInUse.add(hookConfig.query.hook);
    this.visitor.reactQueryOptionsIdentifiersInUse.add(hookConfig.query.options);

    const options = `options?: ${hookConfig.query.options}<${operationResultType}, TError, TData>`;

    return `export const use${operationName} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      ${variables},
      ${options}
    ) =>
    ${hookConfig.query.hook}<${operationResultType}, TError, TData>(
      ${this.generateQueryFormattedParameters(
        this.generateQueryKey(node, hasRequiredVariables),
        `fetcher<${operationResultType}, ${operationVariablesTypes}>(dataSource.endpoint, dataSource.fetchParams || {}, ${documentVariableName}, variables)`,
      )}
    );`;
  }

  generateMutationHook(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string {
    const variables = `variables?: ${operationVariablesTypes}`;
    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryHookIdentifiersInUse.add(hookConfig.mutation.hook);
    this.visitor.reactQueryOptionsIdentifiersInUse.add(hookConfig.mutation.options);

    const options = `options?: ${hookConfig.mutation.options}<${operationResultType}, TError, ${operationVariablesTypes}, TContext>`;

    return `export const use${operationName} = <
      TError = ${this.visitor.config.errorType},
      TContext = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      ${options}
    ) =>
    ${
      hookConfig.mutation.hook
    }<${operationResultType}, TError, ${operationVariablesTypes}, TContext>(
      ${this.generateMutationFormattedParameters(
        this.generateMutationKey(node),
        `(${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(dataSource.endpoint, dataSource.fetchParams || {}, ${documentVariableName}, variables)()`,
      )}
    );`;
  }

  generateFetcherFetch(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string {
    const variables = this.generateQueryVariablesSignature(
      hasRequiredVariables,
      operationVariablesTypes,
    );

    return `\nuse${operationName}.fetcher = (dataSource: { endpoint: string, fetchParams?: RequestInit }, ${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(dataSource.endpoint, dataSource.fetchParams || {}, ${documentVariableName}, variables);`;
  }
}
