import autoBind from 'auto-bind';
import { OperationDefinitionNode } from 'graphql';
import {
  buildMapperImport,
  ParsedMapper,
  parseMapper,
} from '@graphql-codegen/visitor-plugin-common';
import { CustomFetch } from './config.js';
import { type BuildOperationConfig, FetcherRenderer } from './fetcher.js';
import { ReactQueryVisitor } from './visitor.js';

export class CustomMapperFetcher extends FetcherRenderer {
  private _mapper: ParsedMapper;
  private _isReactHook: boolean;

  constructor(protected visitor: ReactQueryVisitor, customFetcher: CustomFetch) {
    super(visitor);
    if (typeof customFetcher === 'string') {
      customFetcher = { func: customFetcher };
    }
    this._mapper = parseMapper(customFetcher.func);
    this._isReactHook = customFetcher.isReactHook;
    autoBind(this);
  }

  private getFetcherFnName(operationResultType: string, operationVariablesTypes: string): string {
    return `${this._mapper.type}<${operationResultType}, ${operationVariablesTypes}>`;
  }

  generateFetcherImplementation(): string {
    if (this._mapper.isExternal) {
      return buildMapperImport(
        this._mapper.source,
        [
          {
            identifier: this._mapper.type,
            asDefault: this._mapper.default,
          },
        ],
        this.visitor.config.useTypeImports,
      );
    }

    return null;
  }

  generateInfiniteQueryHook(config: BuildOperationConfig): string {
    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
    const implHookOuter = this._isReactHook
      ? `const query = ${typedFetcher}(${documentVariableName})`
      : '';
    const implFetcher = this._isReactHook
      ? `(metaData) => query({...variables, ...(metaData.pageParam ?? {})})`
      : `(metaData) => ${typedFetcher}(${documentVariableName}, {...variables, ...(metaData.pageParam ?? {})})()`;

    const { generateBaseInfiniteQueryHook } = this.generateInfiniteQueryHelper(config);

    return generateBaseInfiniteQueryHook({
      implHookOuter,
      implFetcher,
    });
  }

  generateQueryHook(config: BuildOperationConfig): string {
    const { generateBaseQueryHook } = this.generateQueryHelper(config);

    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
    const implFetcher = this._isReactHook
      ? `${typedFetcher}(${documentVariableName}).bind(null, variables)`
      : `${typedFetcher}(${documentVariableName}, variables)`;

    return generateBaseQueryHook({
      implFetcher,
    });
  }

  generateMutationHook(config: BuildOperationConfig): string {
    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    const { generateBaseMutationHook, variables } = this.generateMutationHelper(config);

    const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
    const implFetcher = this._isReactHook
      ? `${typedFetcher}(${documentVariableName})`
      : `(${variables}) => ${typedFetcher}(${documentVariableName}, variables)()`;

    return generateBaseMutationHook({
      implFetcher,
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
    // We can't generate a fetcher field since we can't call react hooks outside of a React Fucntion Component
    // Related: https://reactjs.org/docs/hooks-rules.html
    if (this._isReactHook) return '';

    const variables = `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;

    const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
    const impl = `${typedFetcher}(${documentVariableName}, variables, options)`;

    return `\nuse${operationName}.fetcher = (${variables}, options?: RequestInit['headers']) => ${impl};`;
  }
}
