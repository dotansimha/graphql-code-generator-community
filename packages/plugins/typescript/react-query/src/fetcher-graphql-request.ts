import autoBind from 'auto-bind';
import { OperationDefinitionNode } from 'graphql';
import { GraphQlRequest } from './config.js';
import { type BuildOperationConfig, FetcherRenderer } from './fetcher.js';
import { ReactQueryVisitor } from './visitor.js';

export class GraphQLRequestClientFetcher extends FetcherRenderer {
  private clientPath: string | null;

  constructor(protected visitor: ReactQueryVisitor, config: GraphQlRequest) {
    super(visitor);
    this.clientPath = typeof config === 'object' ? config.clientImportPath : null;
    autoBind(this);
  }

  generateFetcherImplementation(): string {
    return this.clientPath
      ? `
function fetcher<TData, TVariables extends { [key: string]: any }>(query: string, variables?: TVariables, requestHeaders?: RequestInit['headers']) {
  return async (): Promise<TData> => graphqlClient.request({
    document: query,
    variables,
    requestHeaders
  });
}`
      : `
function fetcher<TData, TVariables extends { [key: string]: any }>(client: GraphQLClient, query: string, variables?: TVariables, requestHeaders?: RequestInit['headers']) {
  return async (): Promise<TData> => client.request({
    document: query,
    variables,
    requestHeaders
  });
}`;
  }

  generateInfiniteQueryHook(config: BuildOperationConfig): string {
    const typeImport = this.visitor.config.useTypeImports ? 'import type' : 'import';
    if (this.clientPath) this.visitor.imports.add(this.clientPath);
    this.visitor.imports.add(`${typeImport} { GraphQLClient } from 'graphql-request';`);

    const { generateBaseInfiniteQueryHook, variables, options } =
      this.generateInfiniteQueryHelper(config);

    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    return this.clientPath
      ? generateBaseInfiniteQueryHook({
          implArguments: `
      pageParamKey: keyof ${operationVariablesTypes},
      ${variables},
      ${options},
      headers?: RequestInit['headers']
    `,
          implFetcher: `(metaData) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, {...variables, [pageParamKey]: metaData.pageParam}, headers)()`,
        })
      : generateBaseInfiniteQueryHook({
          implArguments: `
      client: GraphQLClient,
      ${variables},
      ${options},
      headers?: RequestInit['headers']
    `,
          implFetcher: `(metaData) => fetcher<${operationResultType}, ${operationVariablesTypes}>(client, ${documentVariableName}, {...variables, ...(metaData.pageParam ?? {})}, headers)()`,
        });
  }

  generateQueryHook(config: BuildOperationConfig): string {
    const typeImport = this.visitor.config.useTypeImports ? 'import type' : 'import';
    if (this.clientPath) this.visitor.imports.add(this.clientPath);
    this.visitor.imports.add(`${typeImport} { GraphQLClient } from 'graphql-request';`);
    this.visitor.imports.add(
      `${typeImport} { RequestInit } from 'graphql-request/dist/types.dom';`,
    );

    const { generateBaseQueryHook, variables, options } = this.generateQueryHelper(config);

    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    return this.clientPath
      ? generateBaseQueryHook({
          implArguments: `
      ${variables},
      ${options},
      headers?: RequestInit['headers']
    `,
          implFetcher: `fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables, headers)`,
        })
      : generateBaseQueryHook({
          implArguments: `
      client: GraphQLClient,
      ${variables},
      ${options},
      headers?: RequestInit['headers']
    `,
          implFetcher: `fetcher<${operationResultType}, ${operationVariablesTypes}>(client, ${documentVariableName}, variables, headers)`,
        });
  }

  generateMutationHook(config: BuildOperationConfig): string {
    const typeImport = this.visitor.config.useTypeImports ? 'import type' : 'import';
    if (this.clientPath) this.visitor.imports.add(this.clientPath);
    this.visitor.imports.add(`${typeImport} { GraphQLClient } from 'graphql-request';`);

    const { generateBaseMutationHook, variables, options } = this.generateMutationHelper(config);

    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    return this.clientPath
      ? generateBaseMutationHook({
          implArguments: `
      ${options},
      headers?: RequestInit['headers']
    `,
          implFetcher: `(${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables, headers)()`,
        })
      : generateBaseMutationHook({
          implArguments: `
      client: GraphQLClient,
      ${options},
      headers?: RequestInit['headers']
    `,
          implFetcher: `(${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(client, ${documentVariableName}, variables, headers)()`,
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
    const typeImport = this.visitor.config.useTypeImports ? 'import type' : 'import';
    if (this.clientPath) this.visitor.imports.add(this.clientPath);
    this.visitor.imports.add(
      `${typeImport} { RequestInit } from 'graphql-request/dist/types.dom';`,
    );

    return this.clientPath
      ? `\nuse${operationName}.fetcher = (${variables}, headers?: RequestInit['headers']) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables, headers);`
      : `\nuse${operationName}.fetcher = (client: GraphQLClient, ${variables}, headers?: RequestInit['headers']) => fetcher<${operationResultType}, ${operationVariablesTypes}>(client, ${documentVariableName}, variables, headers);`;
  }
}
