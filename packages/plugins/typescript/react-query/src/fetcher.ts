import autoBind from 'auto-bind';
import { OperationDefinitionNode } from 'graphql';
import { ReactQueryVisitor } from './visitor.js';

export interface GenerateConfig {
  node: OperationDefinitionNode;
  documentVariableName: string;
  operationName: string;
  operationResultType: string;
  operationVariablesTypes: string;
  hasRequiredVariables: boolean;
  isSuspense?: boolean;
}

interface GenerateBaseHookConfig {
  implArguments?: string;
  implHookOuter?: string;
  implFetcher: string;
}

type ReactQueryMethodMap = {
  [key: string]: {
    getHook: (config?: { isSuspense?: boolean; operationName?: string }) => string;
    getOptions: (config?: { isSuspense?: boolean }) => string;
  };
};

export class BaseFetcherRenderer {
  constructor(protected visitor: ReactQueryVisitor) {
    autoBind(this);
  }

  private queryMethodMap: ReactQueryMethodMap = {
    infiniteQuery: {
      getHook: ({ isSuspense = false, operationName = 'Query' } = {}) =>
        `use${isSuspense ? 'Suspense' : ''}Infinite${operationName}`,
      getOptions: ({ isSuspense = false } = {}) =>
        `Use${isSuspense ? 'Suspense' : ''}InfiniteQueryOptions`,
    },
    query: {
      getHook: ({ isSuspense = false, operationName = 'Query' } = {}) =>
        `use${isSuspense ? 'Suspense' : ''}${operationName}`,
      getOptions: ({ isSuspense = false } = {}) => `Use${isSuspense ? 'Suspense' : ''}QueryOptions`,
    },
    mutation: {
      getHook: ({ operationName = 'Mutation' } = {}) => `use${operationName}`,
      getOptions: () => `UseMutationOptions`,
    },
  };

  protected generateInfiniteQueryHelper(config: GenerateConfig) {
    const { operationResultType, operationName } = config;

    this.visitor.reactQueryHookIdentifiersInUse.add(this.queryMethodMap.infiniteQuery.getHook());
    this.visitor.reactQueryOptionsIdentifiersInUse.add(
      this.queryMethodMap.infiniteQuery.getOptions(),
    );

    const variables = this.generateInfiniteQueryVariablesSignature(config);

    const options = this.generateInfiniteQueryOptionsSignature(config);

    const generateBaseInfiniteQueryHook = (hookConfig: GenerateBaseHookConfig) => {
      const { implArguments, implHookOuter = '', implFetcher } = hookConfig;

      const argumentsResult =
        implArguments ??
        `
      ${variables},
      ${options}
    `;

      return `export const useInfinite${operationName} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(${argumentsResult}) => {
    ${implHookOuter}
    return ${this.queryMethodMap.infiniteQuery.getHook()}<${operationResultType}, TError, TData>(
      ${this.generateInfiniteQueryFormattedParameters(
        this.generateInfiniteQueryKey(config),
        implFetcher,
      )}
    )};`;
    };

    return { generateBaseInfiniteQueryHook, variables, options };
  }

  protected generateQueryHelper(config: GenerateConfig) {
    const { operationName, operationResultType, operationVariablesTypes, hasRequiredVariables } =
      config;

    this.visitor.reactQueryHookIdentifiersInUse.add(this.queryMethodMap.query.getHook());
    this.visitor.reactQueryOptionsIdentifiersInUse.add(this.queryMethodMap.query.getOptions());

    const variables = this.generateQueryVariablesSignature(
      hasRequiredVariables,
      operationVariablesTypes,
    );

    const options = this.generateQueryOptionsSignature(operationResultType);

    const generateBaseQueryHook = (hookConfig: GenerateBaseHookConfig) => {
      const { implArguments, implHookOuter = '', implFetcher } = hookConfig;

      const argumentsResult =
        implArguments ??
        `
      ${variables},
      ${options}
    `;

      return `export const use${operationName} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(${argumentsResult}) => {
    ${implHookOuter}
    return ${this.queryMethodMap.query.getHook()}<${operationResultType}, TError, TData>(
      ${this.generateQueryFormattedParameters(this.generateQueryKey(config), implFetcher)}
    )};`;
    };

    return {
      generateBaseQueryHook,
      variables,
      options,
    };
  }

  protected generateMutationHelper(config: GenerateConfig) {
    const { operationResultType, operationVariablesTypes, operationName } = config;

    this.visitor.reactQueryHookIdentifiersInUse.add(this.queryMethodMap.mutation.getHook());
    this.visitor.reactQueryOptionsIdentifiersInUse.add(this.queryMethodMap.mutation.getOptions());

    const variables = `variables?: ${operationVariablesTypes}`;

    const options = `options?: ${this.queryMethodMap.mutation.getOptions()}<${operationResultType}, TError, ${operationVariablesTypes}, TContext>`;

    const generateBaseMutationHook = (hookConfig: GenerateBaseHookConfig) => {
      const { implArguments, implHookOuter = '', implFetcher } = hookConfig;

      const argumentsResult = implArguments ?? `${options}`;

      return `export const use${operationName} = <
      TError = ${this.visitor.config.errorType},
      TContext = unknown
    >(${argumentsResult}) => {
    ${implHookOuter}
    return ${this.queryMethodMap.mutation.getHook()}<${operationResultType}, TError, ${operationVariablesTypes}, TContext>(
      ${this.generateMutationFormattedParameters(this.generateMutationKey(config), implFetcher)}
    )};`;
    };

    return {
      generateBaseMutationHook,
      variables,
      options,
    };
  }

  protected generateQueryVariablesSignature(
    hasRequiredVariables: boolean,
    operationVariablesTypes: string,
  ): string {
    return `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
  }

  private generateQueryOptionsSignature(operationResultType: string): string {
    if (this.visitor.config.reactQueryVersion <= 4) {
      return `options?: ${this.queryMethodMap.query.getOptions()}<${operationResultType}, TError, TData>`;
    }
    return `options?: Omit<${this.queryMethodMap.query.getOptions()}<${operationResultType}, TError, TData>, 'queryKey'> & { queryKey?: ${this.queryMethodMap.query.getOptions()}<${operationResultType}, TError, TData>['queryKey'] }`;
  }

  private generateInfiniteQueryVariablesSignature(config: GenerateConfig): string {
    if (this.visitor.config.reactQueryVersion <= 4) {
      return `variables${config.hasRequiredVariables ? '' : '?'}: ${
        config.operationVariablesTypes
      }`;
    }
    return `variables: ${config.operationVariablesTypes}`;
  }

  private generateInfiniteQueryOptionsSignature(config: GenerateConfig): string {
    if (this.visitor.config.reactQueryVersion <= 4) {
      return `options?: ${this.queryMethodMap.infiniteQuery.getOptions()}<${
        config.operationResultType
      }, TError, TData>`;
    }
    return `options: Omit<${this.queryMethodMap.infiniteQuery.getOptions()}<${
      config.operationResultType
    }, TError, TData>, 'queryKey'> & { queryKey?: ${this.queryMethodMap.infiniteQuery.getOptions()}<${
      config.operationResultType
    }, TError, TData>['queryKey'] }`;
  }

  public generateInfiniteQueryKey(config: GenerateConfig): string {
    if (config.hasRequiredVariables) return `['${config.node.name.value}.infinite', variables]`;
    return `variables === undefined ? ['${config.node.name.value}.infinite'] : ['${config.node.name.value}.infinite', variables]`;
  }

  public generateInfiniteQueryKeyMaker(config: GenerateConfig) {
    const signature = this.generateQueryVariablesSignature(
      config.hasRequiredVariables,
      config.operationVariablesTypes,
    );
    return `useInfinite${
      config.operationName
    }.getKey = (${signature}) => ${this.generateInfiniteQueryKey(config)};`;
  }

  public generateInfiniteQueryRootKeyMaker(config: GenerateConfig) {
    return `useInfinite${config.operationName}.rootKey = '${config.node.name.value}.infinite';`;
  }

  public generateQueryKey(config: GenerateConfig): string {
    if (config.hasRequiredVariables) return `['${config.node.name.value}', variables]`;
    return `variables === undefined ? ['${config.node.name.value}'] : ['${config.node.name.value}', variables]`;
  }

  public generateQueryKeyMaker(config: GenerateConfig) {
    const signature = this.generateQueryVariablesSignature(
      config.hasRequiredVariables,
      config.operationVariablesTypes,
    );
    return `use${config.operationName}.getKey = (${signature}) => ${this.generateQueryKey(
      config,
    )};`;
  }

  public generateQueryRootKeyMaker({ operationName, node }: GenerateConfig) {
    return `use${operationName}.rootKey = '${node.name.value}';`;
  }

  public generateMutationKey({ node }: GenerateConfig): string {
    return `['${node.name.value}']`;
  }

  public generateMutationKeyMaker(config: GenerateConfig) {
    return `use${config.operationName}.getKey = () => ${this.generateMutationKey(config)};`;
  }

  private generateInfiniteQueryFormattedParameters(queryKey: string, queryFn: string) {
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

  private generateQueryFormattedParameters(queryKey: string, queryFn: string): string {
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

  private generateMutationFormattedParameters(mutationKey: string, mutationFn: string): string {
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
  public abstract generateFetcherImplementation(): string;
  public abstract generateQueryHook(config: GenerateConfig): string;
  public abstract generateInfiniteQueryHook(config: GenerateConfig): string;
  public abstract generateMutationHook(config: GenerateConfig): string;
  public abstract generateFetcherFetch(config: GenerateConfig): string;
}
