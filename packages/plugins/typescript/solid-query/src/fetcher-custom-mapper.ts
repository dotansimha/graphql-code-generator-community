import autoBind from 'auto-bind';
import {
  buildMapperImport,
  ParsedMapper,
  parseMapper,
} from '@graphql-codegen/visitor-plugin-common';
import { CustomFetch } from './config.js';
import { FetcherRenderer, type GenerateConfig } from './fetcher.js';
import { SolidQueryVisitor } from './visitor.js';

export class CustomMapperFetcher extends FetcherRenderer {
  private _mapper: ParsedMapper;
  private _isSolidHook: boolean;

  constructor(
    protected visitor: SolidQueryVisitor,
    customFetcher: CustomFetch,
  ) {
    super(visitor);
    if (typeof customFetcher === 'string') {
      customFetcher = { func: customFetcher };
    }
    this._mapper = parseMapper(customFetcher.func);
    this._isSolidHook = customFetcher.isSolidHook;
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

  generateInfiniteQueryHook(config: GenerateConfig, isSuspense = false): string {
    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
    const implHookOuter = this._isSolidHook
      ? `const query = ${typedFetcher}(${documentVariableName})`
      : '';
    const implFetcher = this._isSolidHook
      ? `(metaData) => query({...variables, ...(metaData.pageParam ?? {})})`
      : `(metaData) => ${typedFetcher}(${documentVariableName}, {...variables, ...(metaData.pageParam ?? {})})()`;

    const { generateBaseInfiniteQueryHook } = this.generateInfiniteQueryHelper(config, isSuspense);

    return generateBaseInfiniteQueryHook({
      implHookOuter,
      implFetcher,
    });
  }

  generateQueryHook(config: GenerateConfig, isSuspense = false): string {
    const { generateBaseQueryHook } = this.generateQueryHelper(config, isSuspense);

    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
    const implFetcher = this._isSolidHook
      ? `${typedFetcher}(${documentVariableName}).bind(null, variables)`
      : `${typedFetcher}(${documentVariableName}, variables)`;

    return generateBaseQueryHook({
      implFetcher,
    });
  }

  generateMutationHook(config: GenerateConfig): string {
    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    const { generateBaseMutationHook, variables } = this.generateMutationHelper(config);

    const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
    const implFetcher = this._isSolidHook
      ? `${typedFetcher}(${documentVariableName})`
      : `(${variables}) => ${typedFetcher}(${documentVariableName}, variables)()`;

    return generateBaseMutationHook({
      implFetcher,
    });
  }

  generateFetcherFetch(config: GenerateConfig): string {
    const {
      documentVariableName,
      operationResultType,
      operationVariablesTypes,
      hasRequiredVariables,
      operationName,
    } = config;

    // We can't generate a fetcher field since we can't call solid hooks outside of a Solid Fucntion Component
    // Related: https://solidjs.org/docs/hooks-rules.html
    if (this._isSolidHook) return '';

    const variables = `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;

    const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
    const impl = `${typedFetcher}(${documentVariableName}, variables, options)`;

    return `\ncreate${operationName}.fetcher = (${variables}, options?: RequestInit['headers']) => ${impl};`;
  }
}
