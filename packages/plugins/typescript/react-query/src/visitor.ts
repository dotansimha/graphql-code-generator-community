import autoBind from 'auto-bind';
import { pascalCase } from 'change-case-all';
import { GraphQLSchema, OperationDefinitionNode } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  DocumentMode,
  getConfigValue,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import { BaseReactQueryPluginConfig, ReactQueryRawPluginConfig } from './config.js';
import { CustomMapperFetcher } from './fetcher-custom-mapper.js';
import { HardcodedFetchFetcher } from './fetcher-fetch-hardcoded.js';
import { FetchFetcher } from './fetcher-fetch.js';
import { GraphQLRequestClientFetcher } from './fetcher-graphql-request.js';
import { FetcherRenderer, type GenerateConfig } from './fetcher.js';

export type ReactQueryPluginConfig = BaseReactQueryPluginConfig & ClientSideBasePluginConfig;

export class ReactQueryVisitor extends ClientSideBaseVisitor<
  ReactQueryRawPluginConfig,
  ReactQueryPluginConfig
> {
  private _externalImportPrefix: string;
  public fetcher: FetcherRenderer;
  public reactQueryHookIdentifiersInUse = new Set<string>();
  public reactQueryOptionsIdentifiersInUse = new Set<string>();

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    protected rawConfig: ReactQueryRawPluginConfig,
    documents: Types.DocumentFile[],
  ) {
    const defaultReactQueryVersion = !rawConfig.reactQueryVersion && rawConfig.legacyMode ? 3 : 4;

    super(schema, fragments, rawConfig, {
      documentMode: DocumentMode.string,
      errorType: getConfigValue(rawConfig.errorType, 'unknown'),
      exposeDocument: getConfigValue(rawConfig.exposeDocument, false),
      exposeQueryKeys: getConfigValue(rawConfig.exposeQueryKeys, false),
      exposeQueryRootKeys: getConfigValue(rawConfig.exposeQueryRootKeys, false),
      exposeMutationKeys: getConfigValue(rawConfig.exposeMutationKeys, false),
      exposeFetcher: getConfigValue(rawConfig.exposeFetcher, false),
      addInfiniteQuery: getConfigValue(rawConfig.addInfiniteQuery, false),
      addSuspenseQuery: getConfigValue(rawConfig.addSuspenseQuery, false),
      reactQueryVersion: getConfigValue(rawConfig.reactQueryVersion, defaultReactQueryVersion),
      reactQueryImportFrom: getConfigValue(rawConfig.reactQueryImportFrom, ''),
    });

    this._externalImportPrefix = this.config.importOperationTypesFrom
      ? `${this.config.importOperationTypesFrom}.`
      : '';
    this._documents = documents;
    this.fetcher = this.createFetcher(rawConfig.fetcher || 'fetch');

    autoBind(this);
  }

  public get imports(): Set<string> {
    return this._imports;
  }

  private createFetcher(raw: ReactQueryRawPluginConfig['fetcher']): FetcherRenderer {
    if (raw === 'fetch') {
      return new FetchFetcher(this);
    }
    if (typeof raw === 'object' && 'endpoint' in raw) {
      return new HardcodedFetchFetcher(this, raw);
    }
    if (raw === 'graphql-request' || (typeof raw === 'object' && 'clientImportPath' in raw)) {
      return new GraphQLRequestClientFetcher(this, raw);
    }

    return new CustomMapperFetcher(this, raw);
  }

  public get hasOperations() {
    return this._collectedOperations.length > 0;
  }

  public getImports(): string[] {
    const baseImports = super.getImports();

    if (!this.hasOperations) {
      return baseImports;
    }

    const hookAndTypeImports = [
      ...Array.from(this.reactQueryHookIdentifiersInUse),
      ...Array.from(this.reactQueryOptionsIdentifiersInUse).map(
        identifier => `${this.config.useTypeImports ? 'type ' : ''}${identifier}`,
      ),
    ];

    const moduleName = this.config.reactQueryImportFrom
      ? this.config.reactQueryImportFrom
      : this.config.reactQueryVersion <= 3
      ? 'react-query'
      : '@tanstack/react-query';

    return [...baseImports, `import { ${hookAndTypeImports.join(', ')} } from '${moduleName}';`];
  }

  public getFetcherImplementation(): string {
    return this.fetcher.generateFetcherImplementation();
  }

  private _getHookSuffix(name: string, operationType: string) {
    if (this.config.omitOperationSuffix) {
      return '';
    }
    if (!this.config.dedupeOperationSuffix) {
      return pascalCase(operationType);
    }
    if (name.includes('Query') || name.includes('Mutation') || name.includes('Subscription')) {
      return '';
    }
    return pascalCase(operationType);
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string {
    const nodeName = node.name?.value ?? '';
    const suffix = this._getHookSuffix(nodeName, operationType);
    const operationName: string = this.convertName(nodeName, {
      suffix,
      useTypesPrefix: false,
      useTypesSuffix: false,
    });

    const generateConfig: GenerateConfig = {
      node,
      documentVariableName,
      operationResultType: this._externalImportPrefix + operationResultType,
      operationVariablesTypes: this._externalImportPrefix + operationVariablesTypes,
      hasRequiredVariables,
      operationName,
    };

    const queries: string[] = [];
    const getOutputFromQueries = () => `\n${queries.join('\n\n')}\n`;

    if (operationType === 'Query') {
      const addQuery = (generateConfig: GenerateConfig, isSuspense = false) => {
        const { hook, getKey, rootKey, document } = this.fetcher.generateQueryOutput(
          generateConfig,
          isSuspense,
        );
        queries.push(hook);
        if (this.config.exposeDocument) queries.push(document);
        if (this.config.exposeQueryKeys) queries.push(getKey);
        if (this.config.exposeQueryRootKeys) queries.push(rootKey);
      };

      addQuery(generateConfig);

      if (this.config.addSuspenseQuery) addQuery(generateConfig, true);

      if (this.config.addInfiniteQuery) {
        const addInfiniteQuery = (generateConfig: GenerateConfig, isSuspense = false) => {
          const { hook, getKey, rootKey } = this.fetcher.generateInfiniteQueryOutput(
            generateConfig,
            isSuspense,
          );
          queries.push(hook);
          if (this.config.exposeQueryKeys) queries.push(getKey);
          if (this.config.exposeQueryRootKeys) queries.push(rootKey);
        };

        addInfiniteQuery(generateConfig);

        if (this.config.addSuspenseQuery) {
          addInfiniteQuery(generateConfig, true);
        }
      }
      // The reason we're looking at the private field of the CustomMapperFetcher to see if it's a react hook
      // is to prevent calling generateFetcherFetch for each query since all the queries won't be able to generate
      // a fetcher field anyways.
      if (this.config.exposeFetcher && !(this.fetcher as any)._isReactHook) {
        queries.push(this.fetcher.generateFetcherFetch(generateConfig));
      }
      return getOutputFromQueries();
    }
    if (operationType === 'Mutation') {
      const { hook, getKey } = this.fetcher.generateMutationOutput(generateConfig);
      queries.push(hook);
      if (this.config.exposeMutationKeys) queries.push(getKey);
      if (this.config.exposeFetcher && !(this.fetcher as any)._isReactHook) {
        queries.push(this.fetcher.generateFetcherFetch(generateConfig));
      }
      return getOutputFromQueries();
    }
    if (operationType === 'Subscription') {
      // eslint-disable-next-line no-console
      console.warn(
        `Plugin "typescript-react-query" does not support GraphQL Subscriptions at the moment! Ignoring "${node.name.value}"...`,
      );
    }

    return null;
  }
}
