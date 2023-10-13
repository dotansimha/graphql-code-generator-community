import autoBind from 'auto-bind';
import { OperationDefinitionNode } from 'graphql';
import { type BuildOperationConfig, FetcherRenderer } from './fetcher.js';
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

  generateInfiniteQueryHook(config: BuildOperationConfig): string {
    const { generateBaseInfiniteQueryHook, variables, options } =
      this.generateInfiniteQueryHelper(config);

    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    return generateBaseInfiniteQueryHook({
      implArguments: `
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      ${variables},
      ${options}
    `,
      implFetcher: `(metaData) => fetcher<${operationResultType}, ${operationVariablesTypes}>(dataSource.endpoint, dataSource.fetchParams || {}, ${documentVariableName}, {...variables, ...(metaData.pageParam ?? {})})()`,
    });
  }

  generateQueryHook(config: BuildOperationConfig): string {
    const { generateBaseQueryHook, variables, options } = this.generateQueryHelper(config);

    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    return generateBaseQueryHook({
      implArguments: `
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      ${variables},
      ${options}
    `,
      implFetcher: `fetcher<${operationResultType}, ${operationVariablesTypes}>(dataSource.endpoint, dataSource.fetchParams || {}, ${documentVariableName}, variables)`,
    });
  }

  generateMutationHook(config: BuildOperationConfig): string {
    const { generateBaseMutationHook, variables, options } = this.generateMutationHelper(config);

    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    return generateBaseMutationHook({
      implArguments: `
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      ${options}
    `,
      implFetcher: `(${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(dataSource.endpoint, dataSource.fetchParams || {}, ${documentVariableName}, variables)()`,
    });
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
