import autoBind from 'auto-bind';
import { OperationDefinitionNode } from 'graphql';
import { ReactQueryVisitor } from './visitor.js';

export interface BuildOperationConfig {
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

export class BaseFetcherRenderer {
  constructor(protected visitor: ReactQueryVisitor) {
    autoBind(this);
  }

  protected generateInfiniteQueryHelper(config: BuildOperationConfig) {
    const {
      node,
      operationResultType,
      operationVariablesTypes,
      operationName,
      hasRequiredVariables,
    } = config;

    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryHookIdentifiersInUse.add(hookConfig.infiniteQuery.hook);
    this.visitor.reactQueryOptionsIdentifiersInUse.add(hookConfig.infiniteQuery.options);

    const variables = this.generateInfiniteQueryVariablesSignature(
      hasRequiredVariables,
      operationVariablesTypes,
    );

    const options = this.generateInfiniteQueryOptionsSignature(
      hookConfig.infiniteQuery.options,
      operationResultType,
    );

    const generateBaseInfiniteQueryHook = (config: GenerateBaseHookConfig) => {
      const { implArguments, implHookOuter = '', implFetcher } = config;

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
    return ${hookConfig.infiniteQuery.hook}<${operationResultType}, TError, TData>(
      ${this.generateInfiniteQueryFormattedParameters(
        this.generateInfiniteQueryKey(node, hasRequiredVariables),
        implFetcher,
      )}
    )};`;
    };

    return { generateBaseInfiniteQueryHook, variables, options };
  }

  protected generateQueryHelper(config: BuildOperationConfig) {
    const {
      node,
      operationName,
      operationResultType,
      operationVariablesTypes,
      hasRequiredVariables,
    } = config;

    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryHookIdentifiersInUse.add(hookConfig.query.hook);
    this.visitor.reactQueryOptionsIdentifiersInUse.add(hookConfig.query.options);

    const variables = this.generateQueryVariablesSignature(
      hasRequiredVariables,
      operationVariablesTypes,
    );

    const options = this.generateQueryOptionsSignature(
      hookConfig.query.options,
      operationResultType,
    );

    const generateBaseQueryHook = (config: GenerateBaseHookConfig) => {
      const { implArguments, implHookOuter = '', implFetcher } = config;

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
    return ${hookConfig.query.hook}<${operationResultType}, TError, TData>(
      ${this.generateQueryFormattedParameters(
        this.generateQueryKey(node, hasRequiredVariables),
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

  protected generateMutationHelper(config: BuildOperationConfig) {
    const { node, operationResultType, operationVariablesTypes, operationName } = config;

    const hookConfig = this.visitor.queryMethodMap;
    this.visitor.reactQueryHookIdentifiersInUse.add(hookConfig.mutation.hook);
    this.visitor.reactQueryOptionsIdentifiersInUse.add(hookConfig.mutation.options);

    const variables = `variables?: ${operationVariablesTypes}`;

    const options = `options?: ${hookConfig.mutation.options}<${operationResultType}, TError, ${operationVariablesTypes}, TContext>`;

    const generateBaseMutationHook = (config: GenerateBaseHookConfig) => {
      const { implArguments, implHookOuter = '', implFetcher } = config;

      const argumentsResult = implArguments ?? `${options}`;

      return `export const use${operationName} = <
      TError = ${this.visitor.config.errorType},
      TContext = unknown
    >(${argumentsResult}) => {
    ${implHookOuter}
    return ${
      hookConfig.mutation.hook
    }<${operationResultType}, TError, ${operationVariablesTypes}, TContext>(
      ${this.generateMutationFormattedParameters(this.generateMutationKey(node), implFetcher)}
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

  private generateQueryOptionsSignature(queryOptions: string, operationResultType: string): string {
    if (this.visitor.config.reactQueryVersion <= 4) {
      return `options?: ${queryOptions}<${operationResultType}, TError, TData>`;
    }
    return `options?: Omit<${queryOptions}<${operationResultType}, TError, TData>, 'queryKey'> & { queryKey?: ${queryOptions}<${operationResultType}, TError, TData>['queryKey'] }`;
  }

  private generateInfiniteQueryVariablesSignature(
    hasRequiredVariables: boolean,
    operationVariablesTypes: string,
  ): string {
    if (this.visitor.config.reactQueryVersion <= 4) {
      return `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
    }
    return `variables: ${operationVariablesTypes}`;
  }

  private generateInfiniteQueryOptionsSignature(
    infiniteQueryOptions: string,
    operationResultType: string,
  ): string {
    if (this.visitor.config.reactQueryVersion <= 4) {
      return `options?: ${infiniteQueryOptions}<${operationResultType}, TError, TData>`;
    }
    return `options: Omit<${infiniteQueryOptions}<${operationResultType}, TError, TData>, 'queryKey'> & { queryKey?: ${infiniteQueryOptions}<${operationResultType}, TError, TData>['queryKey'] }`;
  }

  public generateInfiniteQueryKey(
    node: OperationDefinitionNode,
    hasRequiredVariables: boolean,
  ): string {
    if (hasRequiredVariables) return `['${node.name.value}.infinite', variables]`;
    return `variables === undefined ? ['${node.name.value}.infinite'] : ['${node.name.value}.infinite', variables]`;
  }

  public generateInfiniteQueryKeyMaker(
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

  public generateInfiniteQueryRootKeyMaker(node: OperationDefinitionNode, operationName: string) {
    return `\nuseInfinite${operationName}.rootKey = '${node.name.value}.infinite';\n`;
  }

  public generateQueryKey(node: OperationDefinitionNode, hasRequiredVariables: boolean): string {
    if (hasRequiredVariables) return `['${node.name.value}', variables]`;
    return `variables === undefined ? ['${node.name.value}'] : ['${node.name.value}', variables]`;
  }

  public generateQueryKeyMaker(
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

  public generateQueryRootKeyMaker(node: OperationDefinitionNode, operationName: string) {
    return `\nuse${operationName}.rootKey = '${node.name.value}';\n`;
  }

  public generateMutationKey(node: OperationDefinitionNode): string {
    return `['${node.name.value}']`;
  }

  public generateMutationKeyMaker(node: OperationDefinitionNode, operationName: string) {
    return `\nuse${operationName}.getKey = () => ${this.generateMutationKey(node)};\n`;
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
  public abstract generateQueryHook(config: BuildOperationConfig): string;
  public abstract generateInfiniteQueryHook(config: BuildOperationConfig): string;
  public abstract generateMutationHook(config: BuildOperationConfig): string;
  public abstract generateFetcherFetch(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string;
}
