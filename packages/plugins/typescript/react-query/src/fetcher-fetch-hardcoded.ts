import autoBind from 'auto-bind';
import { HardcodedFetch } from './config.js';
import { FetcherRenderer, type GenerateConfig } from './fetcher.js';
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

  generateInfiniteQueryHook(config: GenerateConfig): string {
    const { generateBaseInfiniteQueryHook } = this.generateInfiniteQueryHelper(config);

    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    return generateBaseInfiniteQueryHook({
      implFetcher: `(metaData) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, {...variables, ...(metaData.pageParam ?? {})})()`,
    });
  }

  generateQueryHook(config: GenerateConfig): string {
    const { generateBaseQueryHook } = this.generateQueryHelper(config);

    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    return generateBaseQueryHook({
      implFetcher: `fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables)`,
    });
  }

  generateMutationHook(config: GenerateConfig): string {
    const { generateBaseMutationHook, variables } = this.generateMutationHelper(config);

    const { documentVariableName, operationResultType, operationVariablesTypes } = config;

    return generateBaseMutationHook({
      implFetcher: `(${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables)()`,
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

    const variables = this.generateQueryVariablesSignature(
      hasRequiredVariables,
      operationVariablesTypes,
    );

    return `\nuse${operationName}.fetcher = (${variables}) => fetcher<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables);`;
  }
}
