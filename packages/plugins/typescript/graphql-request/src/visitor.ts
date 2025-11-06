import autoBind from 'auto-bind';
import { GraphQLSchema, Kind, OperationDefinitionNode, print } from 'graphql';
import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  DocumentMode,
  getConfigValue,
  indentMultiline,
  transformComment,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import { RawGraphQLRequestPluginConfig } from './config.js';

export interface GraphQLRequestPluginConfig extends ClientSideBasePluginConfig {
  rawRequest: boolean;
  extensionsType: string;
}

const additionalExportedTypes = `
export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;
`;

export class GraphQLRequestVisitor extends ClientSideBaseVisitor<
  RawGraphQLRequestPluginConfig,
  GraphQLRequestPluginConfig
> {
  private _externalImportPrefix: string;
  private _operationsToInclude: {
    node: OperationDefinitionNode;
    documentVariableName: string;
    operationType: string;
    operationResultType: string;
    operationVariablesTypes: string;
  }[] = [];

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: RawGraphQLRequestPluginConfig,
  ) {
    super(schema, fragments, rawConfig, {
      rawRequest: getConfigValue(rawConfig.rawRequest, false),
      extensionsType: getConfigValue(rawConfig.extensionsType, 'any'),
    });

    autoBind(this);

    const typeImport = this.config.useTypeImports ? 'import type' : 'import';

    this._additionalImports.push(
      `${typeImport} { GraphQLClient, RequestOptions } from 'graphql-request';`,
    );

    if (this.config.rawRequest) {
      if (this.config.documentMode !== DocumentMode.string) {
        this._additionalImports.push(`import { GraphQLError, print } from 'graphql'`);
      } else {
        this._additionalImports.push(`import { GraphQLError } from 'graphql'`);
      }
    }

    this._additionalImports.push(
      `type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];`,
    );

    this._externalImportPrefix = this.config.importOperationTypesFrom
      ? `${this.config.importOperationTypesFrom}.`
      : '';
  }

  public OperationDefinition(node: OperationDefinitionNode) {
    const operationName = node.name?.value;

    if (!operationName) {
      // eslint-disable-next-line no-console
      console.warn(
        `Anonymous GraphQL operation was ignored in "typescript-graphql-request", please make sure to name your operation: `,
        print(node),
      );

      return null;
    }

    return super.OperationDefinition(node);
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string,
  ): string {
    operationResultType = this._externalImportPrefix + operationResultType;
    operationVariablesTypes = this._externalImportPrefix + operationVariablesTypes;

    this._operationsToInclude.push({
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes,
    });

    return null;
  }

  private getDocumentNodeVariable(documentVariableName: string): string {
    return this.config.documentMode === DocumentMode.external
      ? `Operations.${documentVariableName}`
      : documentVariableName;
  }

  public get sdkContent(): string {
    const extraVariables: string[] = [];
    const allPossibleActions = this._operationsToInclude
      .map(o => {
        const operationType = o.node.operation;
        const operationName = o.node.name.value;
        const operationDocComment = transformComment(o.node.description);
        const optionalVariables =
          !o.node.variableDefinitions ||
          o.node.variableDefinitions.length === 0 ||
          o.node.variableDefinitions.every(
            v => v.type.kind !== Kind.NON_NULL_TYPE || v.defaultValue,
          );
        const docVarName = this.getDocumentNodeVariable(o.documentVariableName);

        if (this.config.rawRequest) {
          let docArg = docVarName;
          if (this.config.documentMode !== DocumentMode.string) {
            docArg = `${docVarName}String`;
            extraVariables.push(`const ${docArg} = print(${docVarName});`);
          }
          return `${operationDocComment}${operationName}(variables${optionalVariables ? '?' : ''}: ${
            o.operationVariablesTypes
          }, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: ${
            o.operationResultType
          }; errors?: GraphQLError[]; extensions?: ${
            this.config.extensionsType
          }; headers: Headers; status: number; }> {
    return withWrapper((wrappedRequestHeaders) => client.rawRequest<${
      o.operationResultType
    }>(${docArg}, variables, {...requestHeaders, ...wrappedRequestHeaders}), '${operationName}', '${operationType}', variables);
}`;
        }
        return `${operationDocComment}${operationName}(variables${optionalVariables ? '?' : ''}: ${
          o.operationVariablesTypes
        }, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<${o.operationResultType}> {
  return withWrapper((wrappedRequestHeaders) => client.request<${
    o.operationResultType
  }>({ document: ${docVarName}, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), '${operationName}', '${operationType}', variables);
}`;
      })
      .filter(Boolean)
      .map(s => indentMultiline(s, 2));

    return `${additionalExportedTypes}

const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();
${extraVariables.join('\n')}
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
${allPossibleActions.join(',\n')}
  };
}
export type Sdk = ReturnType<typeof getSdk>;`;
  }
}
