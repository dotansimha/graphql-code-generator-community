import autoBind from 'auto-bind';
import { OperationDefinitionNode } from 'graphql';
import { GraphQlRequest } from './config.js';
import { FetcherRenderer } from './fetcher.js';
import { ReactQueryVisitor } from './visitor.js';

export class GraphQLRequestClientFetcher extends FetcherRenderer {
  private clientPath: string | null;

  constructor(protected visitor: ReactQueryVisitor, config: GraphQlRequest) {
    super(visitor);
    this.clientPath = typeof config === 'object' ? config.clientImportPath : null;
    autoBind(this);
  }

  generateFetcherImplementaion(): string {
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

    const typeImport = this.visitor.config.useTypeImports ? 'import type' : 'import';
    if (this.clientPath) this.visitor.imports.add(this.clientPath);
    this.visitor.imports.add(`${typeImport} { GraphQLClient } from 'graphql-request';`);

    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryHookIdentifiersInUse.add(hookConfig.infiniteQuery.hook);
    this.visitor.reactQueryOptionsIdentifiersInUse.add(hookConfig.infiniteQuery.options);

    const options = this.generateInfiniteQueryOptionsSignature(
      hookConfig.infiniteQuery.options,
      operationResultType,
    );

    return this.clientPath
      ? `export const useInfinite${operationName} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(
      pageParamKey: keyof ${operationVariablesTypes},
      ${variables},
      ${options},
      headers?: RequestInit['headers']
    ) =>
    ${hookConfig.infiniteQuery.hook}<${operationResultType}, TError, TData>(
      ${this.generateInfiniteQueryFormattedParameters(
        this.generateInfiniteQueryKey(node, hasRequiredVariables),
        `(metaData) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, {...variables, [pageParamKey]: metaData.pageParam}, headers)()`,
      )}
    );`
      : `export const useInfinite${operationName} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(
      client: GraphQLClient,
      ${variables},
      ${options},
      headers?: RequestInit['headers']
    ) =>
    ${hookConfig.infiniteQuery.hook}<${operationResultType}, TError, TData>(
      ${this.generateInfiniteQueryFormattedParameters(
        this.generateInfiniteQueryKey(node, hasRequiredVariables),
        `(metaData) => fetcher<${operationResultType}, ${operationVariablesTypes}>(client, ${documentVariableName}, {...variables, ...(metaData.pageParam ?? {})}, headers)()`,
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

    const typeImport = this.visitor.config.useTypeImports ? 'import type' : 'import';
    if (this.clientPath) this.visitor.imports.add(this.clientPath);
    this.visitor.imports.add(`${typeImport} { GraphQLClient } from 'graphql-request';`);
    this.visitor.imports.add(
      `${typeImport} { RequestInit } from 'graphql-request/dist/types.dom';`,
    );

    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryHookIdentifiersInUse.add(hookConfig.query.hook);
    this.visitor.reactQueryOptionsIdentifiersInUse.add(hookConfig.query.options);

    const options = `options?: ${hookConfig.query.options}<${operationResultType}, TError, TData>`;

    return this.clientPath
      ? `export const use${operationName} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(
      ${variables},
      ${options},
      headers?: RequestInit['headers']
    ) =>
    ${hookConfig.query.hook}<${operationResultType}, TError, TData>(
      ${this.generateQueryFormattedParameters(
        this.generateQueryKey(node, hasRequiredVariables),
        `fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables, headers)`,
      )}
    );`
      : `export const use${operationName} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(
      client: GraphQLClient,
      ${variables},
      ${options},
      headers?: RequestInit['headers']
    ) =>
    ${hookConfig.query.hook}<${operationResultType}, TError, TData>(
      ${this.generateQueryFormattedParameters(
        this.generateQueryKey(node, hasRequiredVariables),
        `fetcher<${operationResultType}, ${operationVariablesTypes}>(client, ${documentVariableName}, variables, headers)`,
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
    const typeImport = this.visitor.config.useTypeImports ? 'import type' : 'import';
    if (this.clientPath) this.visitor.imports.add(this.clientPath);
    this.visitor.imports.add(`${typeImport} { GraphQLClient } from 'graphql-request';`);

    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryHookIdentifiersInUse.add(hookConfig.mutation.hook);
    this.visitor.reactQueryOptionsIdentifiersInUse.add(hookConfig.mutation.options);

    const options = `options?: ${hookConfig.mutation.options}<${operationResultType}, TError, ${operationVariablesTypes}, TContext>`;

    return this.clientPath
      ? `export const use${operationName} = <
      TError = ${this.visitor.config.errorType},
      TContext = unknown
    >(
      ${options},
      headers?: RequestInit['headers']
    ) =>
    ${
      hookConfig.mutation.hook
    }<${operationResultType}, TError, ${operationVariablesTypes}, TContext>(
      ${this.generateMutationFormattedParameters(
        this.generateMutationKey(node),
        `(${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables, headers)()`,
      )}
    );`
      : `export const use${operationName} = <
      TError = ${this.visitor.config.errorType},
      TContext = unknown
    >(
      client: GraphQLClient,
      ${options},
      headers?: RequestInit['headers']
    ) =>
    ${
      hookConfig.mutation.hook
    }<${operationResultType}, TError, ${operationVariablesTypes}, TContext>(
      ${this.generateMutationFormattedParameters(
        this.generateMutationKey(node),
        `(${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(client, ${documentVariableName}, variables, headers)()`,
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
