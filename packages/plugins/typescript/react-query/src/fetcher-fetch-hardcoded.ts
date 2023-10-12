import autoBind from 'auto-bind';
import { OperationDefinitionNode } from 'graphql';
import { HardcodedFetch } from './config.js';
import { FetcherRenderer, type GenerateQueryHookConfig } from './fetcher.js';
import { ReactQueryVisitor } from './visitor.js';

export class HardcodedFetchFetcher extends FetcherRenderer {
  constructor(protected visitor: ReactQueryVisitor, private config: HardcodedFetch) {
    super(visitor);
    autoBind(this);
  }

  private getEndpoint(): string {
    try {
      new URL(this.config.endpoint);

      return JSON.stringify(this.config.endpoint);
    } catch (e) {
      return `${this.config.endpoint} as string`;
    }
  }

  private getFetchParams(): string {
    let fetchParamsPartial = '';

    if (this.config.fetchParams) {
      const fetchParamsString =
        typeof this.config.fetchParams === 'string'
          ? this.config.fetchParams
          : JSON.stringify(this.config.fetchParams);

      fetchParamsPartial = `\n    ...(${fetchParamsString}),`;
    }

    return `    method: "POST",${fetchParamsPartial}`;
  }

  generateFetcherImplementation(): string {
    return `
function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch(${this.getEndpoint()}, {
${this.getFetchParams()}
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
      ${variables},
      ${options}
    ) =>
    ${hookConfig.infiniteQuery.hook}<${operationResultType}, TError, TData>(
      ${this.generateInfiniteQueryFormattedParameters(
        this.generateInfiniteQueryKey(node, hasRequiredVariables),
        `(metaData) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, {...variables, ...(metaData.pageParam ?? {})})()`,
      )}
    );`;
  }

  generateQueryHook(config: GenerateQueryHookConfig): string {
    const { generateBaseQueryHook } = this.generateQueryHelper(config);

    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    return generateBaseQueryHook({
      implFetcher: `fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables)`,
    });
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
    >(${options}) =>
    ${
      hookConfig.mutation.hook
    }<${operationResultType}, TError, ${operationVariablesTypes}, TContext>(
      ${this.generateMutationFormattedParameters(
        this.generateMutationKey(node),
        `(${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables)()`,
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

    return `\nuse${operationName}.fetcher = (${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables);`;
  }
}
