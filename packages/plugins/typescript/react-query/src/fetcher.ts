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
}

interface GenerateBaseHookConfig {
  implArguments?: string;
  implHookOuter?: string;
  implFetcher: string;
}

type ReactQueryMethodMap = {
  [key: string]: {
    getHook: (operationName?: string) => string;
    getOptions: () => string;
    getOtherTypes?: () => { [key: string]: string };
  };
};

export abstract class FetcherRenderer {
  constructor(protected visitor: ReactQueryVisitor) {
    autoBind(this);
  }

  public abstract generateFetcherImplementation(): string;
  public abstract generateFetcherFetch(config: GenerateConfig): string;
  protected abstract generateQueryHook(config: GenerateConfig, isSuspense?: boolean): string;
  protected abstract generateInfiniteQueryHook(
    config: GenerateConfig,
    isSuspense?: boolean,
  ): string;
  protected abstract generateMutationHook(config: GenerateConfig): string;

  public createQueryMethodMap(isSuspense = false) {
    const suspenseText = isSuspense ? 'Suspense' : '';
    const queryMethodMap: ReactQueryMethodMap = {
      infiniteQuery: {
        getHook: (operationName = 'Query') => `use${suspenseText}Infinite${operationName}`,
        getOptions: () => `Use${suspenseText}InfiniteQueryOptions`,
        getOtherTypes: () => ({ infiniteData: 'InfiniteData' }),
      },
      query: {
        getHook: (operationName = 'Query') => `use${suspenseText}${operationName}`,
        getOptions: () => `Use${suspenseText}QueryOptions`,
      },
      mutation: {
        getHook: (operationName = 'Mutation') => `use${operationName}`,
        getOptions: () => `UseMutationOptions`,
      },
    };

    return queryMethodMap;
  }

  protected generateInfiniteQueryHelper(config: GenerateConfig, isSuspense: boolean) {
    const { operationResultType, operationName } = config;

    const { infiniteQuery } = this.createQueryMethodMap(isSuspense);

    const isNextVersion = this.visitor.config.reactQueryVersion >= 5;

    this.visitor.reactQueryHookIdentifiersInUse.add(infiniteQuery.getHook());
    this.visitor.reactQueryOptionsIdentifiersInUse.add(infiniteQuery.getOptions());
    if (isNextVersion) {
      this.visitor.reactQueryOptionsIdentifiersInUse.add(
        infiniteQuery.getOtherTypes().infiniteData,
      );
    }

    const variables = this.generateInfiniteQueryVariablesSignature(config);
    const options = this.generateInfiniteQueryOptionsSignature(config, isSuspense);

    const generateBaseInfiniteQueryHook = (hookConfig: GenerateBaseHookConfig) => {
      const { implArguments, implHookOuter = '', implFetcher } = hookConfig;

      const argumentsResult =
        implArguments ??
        `
      ${variables},
      ${options}
    `;

      return `export const ${infiniteQuery.getHook(operationName)} = <
      TData = ${
        isNextVersion
          ? `${infiniteQuery.getOtherTypes().infiniteData}<${operationResultType}>`
          : operationResultType
      },
      TError = ${this.visitor.config.errorType}
    >(${argumentsResult}) => {
    ${implHookOuter}
    return ${infiniteQuery.getHook()}<${operationResultType}, TError, TData>(
      ${this.generateInfiniteQueryFormattedParameters(
        this.generateInfiniteQueryKey(config, isSuspense),
        implFetcher,
      )}
    )};`;
    };

    return { generateBaseInfiniteQueryHook, variables, options };
  }

  protected generateQueryHelper(config: GenerateConfig, isSuspense: boolean) {
    const { operationName, operationResultType } = config;

    const { query } = this.createQueryMethodMap(isSuspense);

    this.visitor.reactQueryHookIdentifiersInUse.add(query.getHook());
    this.visitor.reactQueryOptionsIdentifiersInUse.add(query.getOptions());

    const variables = this.generateQueryVariablesSignature(config);
    const options = this.generateQueryOptionsSignature(config, isSuspense);

    const generateBaseQueryHook = (hookConfig: GenerateBaseHookConfig) => {
      const { implArguments, implHookOuter = '', implFetcher } = hookConfig;

      const argumentsResult =
        implArguments ??
        `
      ${variables},
      ${options}
    `;

      return `export const ${query.getHook(operationName)} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(${argumentsResult}) => {
    ${implHookOuter}
    return ${query.getHook()}<${operationResultType}, TError, TData>(
      ${this.generateQueryFormattedParameters(
        this.generateQueryKey(config, isSuspense),
        implFetcher,
      )}
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

    const { mutation } = this.createQueryMethodMap();

    this.visitor.reactQueryHookIdentifiersInUse.add(mutation.getHook());
    this.visitor.reactQueryOptionsIdentifiersInUse.add(mutation.getOptions());

    const variables = `variables?: ${operationVariablesTypes}`;
    const options = `options?: ${mutation.getOptions()}<${operationResultType}, TError, ${operationVariablesTypes}, TContext>`;

    const generateBaseMutationHook = (hookConfig: GenerateBaseHookConfig) => {
      const { implArguments, implHookOuter = '', implFetcher } = hookConfig;

      const argumentsResult = implArguments ?? `${options}`;

      return `export const ${mutation.getHook(operationName)} = <
      TError = ${this.visitor.config.errorType},
      TContext = unknown
    >(${argumentsResult}) => {
    ${implHookOuter}
    return ${mutation.getHook()}<${operationResultType}, TError, ${operationVariablesTypes}, TContext>(
      ${this.generateMutationFormattedParameters(this.generateMutationKey(config), implFetcher)}
    )};`;
    };

    return {
      generateBaseMutationHook,
      variables,
      options,
    };
  }

  protected generateQueryVariablesSignature({
    hasRequiredVariables,
    operationVariablesTypes,
  }: GenerateConfig): string {
    return `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
  }

  private generateQueryOptionsSignature(
    { operationResultType }: GenerateConfig,
    isSuspense: boolean,
  ): string {
    const { query } = this.createQueryMethodMap(isSuspense);

    if (this.visitor.config.reactQueryVersion <= 4) {
      return `options?: ${query.getOptions()}<${operationResultType}, TError, TData>`;
    }
    return `options?: Omit<${query.getOptions()}<${operationResultType}, TError, TData>, 'queryKey'> & { queryKey?: ${query.getOptions()}<${operationResultType}, TError, TData>['queryKey'] }`;
  }

  private generateInfiniteQueryVariablesSignature(config: GenerateConfig): string {
    if (this.visitor.config.reactQueryVersion <= 4) {
      return `variables${config.hasRequiredVariables ? '' : '?'}: ${
        config.operationVariablesTypes
      }`;
    }
    return `variables: ${config.operationVariablesTypes}`;
  }

  private generateInfiniteQueryOptionsSignature(
    { operationResultType }: GenerateConfig,
    isSuspense: boolean,
  ): string {
    const { infiniteQuery } = this.createQueryMethodMap(isSuspense);

    if (this.visitor.config.reactQueryVersion <= 4) {
      return `options?: ${infiniteQuery.getOptions()}<${operationResultType}, TError, TData>`;
    }
    return `options: Omit<${infiniteQuery.getOptions()}<${operationResultType}, TError, TData>, 'queryKey'> & { queryKey?: ${infiniteQuery.getOptions()}<${operationResultType}, TError, TData>['queryKey'] }`;
  }

  public generateInfiniteQueryKey(config: GenerateConfig, isSuspense: boolean): string {
    const identifier = isSuspense ? 'infiniteSuspense' : 'infinite';
    if (config.hasRequiredVariables)
      return `['${config.node.name.value}.${identifier}', variables]`;
    return `variables === undefined ? ['${config.node.name.value}.${identifier}', {}] : ['${config.node.name.value}.${identifier}', variables]`;
  }

  public generateInfiniteQueryOutput(config: GenerateConfig, isSuspense = false) {
    const { infiniteQuery } = this.createQueryMethodMap(isSuspense);
    const signature = this.generateQueryVariablesSignature(config);
    const { operationName, node } = config;
    return {
      hook: this.generateInfiniteQueryHook(config, isSuspense),
      getKey: `${infiniteQuery.getHook(
        operationName,
      )}.getKey = (${signature}) => ${this.generateInfiniteQueryKey(config, isSuspense)};`,
      rootKey: `${infiniteQuery.getHook(operationName)}.rootKey = '${node.name.value}.infinite';`,
    };
  }

  public generateQueryKey(config: GenerateConfig, isSuspense: boolean): string {
    const identifier = isSuspense ? `${config.node.name.value}Suspense` : config.node.name.value;
    if (config.hasRequiredVariables) return `['${identifier}', variables]`;
    return `variables === undefined ? ['${identifier}', {}] : ['${identifier}', variables]`;
  }

  public generateQueryOutput(config: GenerateConfig, isSuspense = false) {
    const { query } = this.createQueryMethodMap(isSuspense);
    const signature = this.generateQueryVariablesSignature(config);
    const { operationName, node, documentVariableName } = config;
    return {
      hook: this.generateQueryHook(config, isSuspense),
      document: `${query.getHook(operationName)}.document = ${documentVariableName};`,
      getKey: `${query.getHook(operationName)}.getKey = (${signature}) => ${this.generateQueryKey(
        config,
        isSuspense,
      )};`,
      rootKey: `${query.getHook(operationName)}.rootKey = '${node.name.value}';`,
    };
  }

  public generateMutationKey({ node }: GenerateConfig): string {
    return `['${node.name.value}']`;
  }

  public generateMutationOutput(config: GenerateConfig) {
    const { mutation } = this.createQueryMethodMap();
    const { operationName } = config;
    return {
      hook: this.generateMutationHook(config),
      getKey: `${mutation.getHook(operationName)}.getKey = () => ${this.generateMutationKey(
        config,
      )};`,
    };
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
