import {
  ClientSideBaseVisitor,
  LoadedFragment,
  getConfigValue,
  DocumentMode,
} from '@graphql-codegen/visitor-plugin-common';
import { OperationDefinitionNode, GraphQLSchema } from 'graphql';
import { pascalCase } from 'change-case-all';
import { RTKQueryPluginConfig, RTKQueryRawPluginConfig } from './config.js';
import autoBind from 'auto-bind';
import { Types } from '@graphql-codegen/plugin-helpers';

export class RTKQueryVisitor extends ClientSideBaseVisitor<RTKQueryRawPluginConfig, RTKQueryPluginConfig> {
  private _externalImportPrefix: string;
  private _endpoints: string[] = [];
  private _hooks: string[] = [];

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    protected rawConfig: RTKQueryRawPluginConfig,
    documents: Types.DocumentFile[]
  ) {
    super(schema, fragments, rawConfig, {
      documentMode: DocumentMode.string,
      importBaseApiFrom: getConfigValue(rawConfig.importBaseApiFrom, ''),
      importBaseApiAlternateName: getConfigValue(rawConfig.importBaseApiAlternateName, 'api'),
      addTransformResponse: getConfigValue(rawConfig.addTransformResponse, false),
      exportHooks: getConfigValue(rawConfig.exportHooks, false),
      overrideExisting: getConfigValue(rawConfig.overrideExisting, ''),
    });
    this._externalImportPrefix = this.config.importOperationTypesFrom ? `${this.config.importOperationTypesFrom}.` : '';
    this._documents = documents;

    autoBind(this);
  }

  public get imports(): Set<string> {
    return this._imports;
  }

  public get hasOperations() {
    return this._collectedOperations.length > 0;
  }

  public getImports(): string[] {
    const baseImports = super.getImports();

    if (!this.hasOperations) {
      return baseImports;
    }

    return [
      ...baseImports,
      `import { ${this.config.importBaseApiAlternateName} } from '${this.config.importBaseApiFrom}';`,
    ];
  }

  public getInjectCall() {
    if (!this.hasOperations) {
      return '';
    }

    return (
      `
const injectedRtkApi = ${this.config.importBaseApiAlternateName}.injectEndpoints({
  ${
    !this.config.overrideExisting
      ? ''
      : `overrideExisting: ${this.config.overrideExisting},
  `
  }endpoints: (build) => ({${this._endpoints.join('')}
  }),
});

export { injectedRtkApi as api };
` +
      (this.config.exportHooks ? `export const { ${this._hooks.join(', ')} } = injectedRtkApi;` : '') +
      '\n\n'
    );
  }

  private injectTransformResponse(Generics: string): string {
    if (this.config.addTransformResponse) {
      const responseType = Generics.split(',')[0];
      return `transformResponse: (response: ${responseType}) => response`;
    }
    return '';
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: 'Query' | 'Mutation' | 'Subscription',
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean
  ): string {
    operationResultType = this._externalImportPrefix + operationResultType;
    operationVariablesTypes = this._externalImportPrefix + operationVariablesTypes;
    const operationName = node.name?.value;
    if (!operationName) return '';

    const Generics = `${operationResultType}, ${operationVariablesTypes}${hasRequiredVariables ? '' : ' | void'}`;

    const operationTypeString = operationType.toLowerCase();

    const functionsString = `query: (variables) => ({ document: ${documentVariableName}, variables })
      ${this.injectTransformResponse(Generics)}`.trim();

    const endpointString = `
    ${operationName}: build.${operationTypeString}<${Generics}>({
      ${functionsString}
    }),`;

    this._endpoints.push(endpointString);

    if (this.config.exportHooks) {
      if (operationType === 'Query') {
        this._hooks.push(`use${pascalCase(operationName)}Query`);
        this._hooks.push(`useLazy${pascalCase(operationName)}Query`);
      }
      if (operationType === 'Mutation') {
        this._hooks.push(`use${pascalCase(operationName)}Mutation`);
      }
    }

    if (operationType === 'Subscription') {
      // eslint-disable-next-line no-console
      console.warn(
        `Plugin "typescript-rtk-query" does not support GraphQL Subscriptions at the moment! Skipping "${node.name?.value}"...`
      );
      return '';
    }

    return '';
  }
}
