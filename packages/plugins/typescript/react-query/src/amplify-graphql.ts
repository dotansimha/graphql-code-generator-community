import { OperationDefinitionNode } from 'graphql';
import { FetcherRenderer } from './fetcher.js';
import {
  generateInfiniteQueryKey,
  generateMutationKey,
  generateQueryKey,
  generateQueryVariablesSignature,
} from './variables-generator.js';
import { ReactQueryVisitor } from './visitor.js';

export class AmplifyGraphqlFetcher implements FetcherRenderer {
  private clientPath: string | null;

  constructor(private visitor: ReactQueryVisitor) {}

  generateFetcherImplementaion(): string {
    return this.clientPath
      ? `
function fetcher<TData, TVariables extends { [key: string]: any }>(query: string, variables?: TVariables, options?: GraphQLOptions) {
  return async (): Promise<TData> => {
    const result = await API.graphql<TData>({
      ...options,
      ...graphqlOperation(query, variables),
    });

    return result.data;
  };
}`
      : `
function fetcher<TData, TVariables extends { [key: string]: any }>(query: string, variables?: TVariables, options?: GraphQLOptions) {
  return async (): Promise<TData> => {
    const result = await API.graphql<TData>({
      ...options,
      ...graphqlOperation(query, variables),
    });

    return result.data;
  };
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
    const variables = generateQueryVariablesSignature(
      hasRequiredVariables,
      operationVariablesTypes,
    );

    const typeImport = this.visitor.config.useTypeImports ? 'import type' : 'import';

    if (this.clientPath) {
      this.visitor.imports.add(this.clientPath);
    }

    this.visitor.imports.add(`${typeImport} { API, graphqlOperation } from '@aws-amplify/api';`);

    this.visitor.imports.add(`${typeImport} { GraphQLOptions } from '@aws-amplify/api-graphql';`);

    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryHookIdentifiersInUse.add(hookConfig.infiniteQuery.hook);
    this.visitor.reactQueryOptionsIdentifiersInUse.add(hookConfig.infiniteQuery.options);

    const options = `options?: ${hookConfig.infiniteQuery.options}<${operationResultType}, TError, TData>`;

    return this.clientPath
      ? `export const useInfinite${operationName} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(
      pageParamKey: keyof ${operationVariablesTypes},
      ${variables},
      ${options},
      apiOptions?: GraphQLOptions
    ) =>
    ${hookConfig.infiniteQuery.hook}<${operationResultType}, TError, TData>(
      ${generateInfiniteQueryKey(node, hasRequiredVariables)},
      (metaData) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, {...variables, ...(metaData.pageParam ?? {})}, apiOptions)(),
      options
    );`
      : `export const useInfinite${operationName} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(
      ${variables},
      ${options},
      apiOptions?: GraphQLOptions
    ) =>
    ${hookConfig.infiniteQuery.hook}<${operationResultType}, TError, TData>(
      ${generateInfiniteQueryKey(node, hasRequiredVariables)},
      (metaData) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, {...variables, ...(metaData.pageParam ?? {})}, apiOptions)(),
      options
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
    const variables = generateQueryVariablesSignature(
      hasRequiredVariables,
      operationVariablesTypes,
    );

    const typeImport = this.visitor.config.useTypeImports ? 'import type' : 'import';

    if (this.clientPath) {
      this.visitor.imports.add(this.clientPath);
    }

    this.visitor.imports.add(`${typeImport} { API, graphqlOperation } from '@aws-amplify/api';`);

    this.visitor.imports.add(`${typeImport} { GraphQLOptions } from '@aws-amplify/api-graphql';`);

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
      apiOptions?: GraphQLOptions
    ) =>
    ${hookConfig.query.hook}<${operationResultType}, TError, TData>(
      ${generateQueryKey(node, hasRequiredVariables)},
      fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables, apiOptions),
      options
    );`
      : `export const use${operationName} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(
      ${variables},
      ${options},
      apiOptions?: GraphQLOptions
    ) =>
    ${hookConfig.query.hook}<${operationResultType}, TError, TData>(
      ${generateQueryKey(node, hasRequiredVariables)},
      fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables, apiOptions),
      options
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

    if (this.clientPath) {
      this.visitor.imports.add(this.clientPath);
    }

    this.visitor.imports.add(`${typeImport} { API, graphqlOperation } from '@aws-amplify/api';`);

    this.visitor.imports.add(`${typeImport} { GraphQLOptions } from '@aws-amplify/api-graphql';`);

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
      apiOptions?: GraphQLOptions
    ) =>
    ${
      hookConfig.mutation.hook
    }<${operationResultType}, TError, ${operationVariablesTypes}, TContext>(
      ${generateMutationKey(node)},
      (${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables, apiOptions)(),
      options
    );`
      : `export const use${operationName} = <
      TError = ${this.visitor.config.errorType},
      TContext = unknown
    >(
      ${options},
      apiOptions?: GraphQLOptions
    ) =>
    ${
      hookConfig.mutation.hook
    }<${operationResultType}, TError, ${operationVariablesTypes}, TContext>(
      ${generateMutationKey(node)},
      (${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables, apiOptions)(),
      options
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
    const variables = generateQueryVariablesSignature(
      hasRequiredVariables,
      operationVariablesTypes,
    );
    const typeImport = this.visitor.config.useTypeImports ? 'import type' : 'import';

    if (this.clientPath) {
      this.visitor.imports.add(this.clientPath);
    }

    this.visitor.imports.add(`${typeImport} { GraphQLOptions } from '@aws-amplify/api-graphql';`);

    return this.clientPath
      ? `\nuse${operationName}.fetcher = (${variables}, options?: GraphQLOptions) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables, options);`
      : `\nuse${operationName}.fetcher = (${variables}, options?: GraphQLOptions) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables, options);`;
  }
}
