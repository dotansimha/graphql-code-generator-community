import autoBind from 'auto-bind';
import { GraphQLSchema, Kind, OperationDefinitionNode, print } from 'graphql';
import {
  ClientSideBaseVisitor,
  getConfigValue,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import { GraphQLSeperateExportPluginConfig, RawGraphQLSeperateExportPluginConfig } from './config';

export class GraphQLRequestSeperateExportVisitor extends ClientSideBaseVisitor<
  RawGraphQLSeperateExportPluginConfig,
  GraphQLSeperateExportPluginConfig
> {
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
    rawConfig: RawGraphQLSeperateExportPluginConfig,
  ) {
    if (!rawConfig.importGraphQLClientStatment) {
      throw new Error(
        "Plugin 'graphql-request-seperate-export' need `importGraphQLClientStatment`.",
      );
    }
    super(schema, fragments, rawConfig, {
      rawRequest: getConfigValue(rawConfig.rawRequest, false),
      importGraphQLClientStatment: rawConfig.importGraphQLClientStatment,
    });
    autoBind(this);
    this._additionalImports.push(
      "import { GraphQLClientRequestHeaders } from 'graphql-request/src/types';",
    );
    this._additionalImports.push(this.config.importGraphQLClientStatment);
    // if (this.config.documentMode !== DocumentMode.string) {
    //   const importType = this.config.useTypeImports ? 'import type' : 'import';
    //   this._additionalImports.push(`${importType} { DocumentNode } from 'graphql';`);
    // }
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string,
  ): string {
    if (node.name == null) {
      throw new Error(
        "Plugin 'graphql-request-seperate-export' cannot generate request functions for unnamed operation.\n\n" +
          print(node),
      );
    } else {
      this._operationsToInclude.push({
        node,
        documentVariableName,
        operationType,
        operationResultType,
        operationVariablesTypes,
      });
    }

    return null;
  }

  public get sdkContent(): string {
    const pureMagicComment = this.config.pureMagicComment;
    const rawRequest = this.config.rawRequest;
    const allPossibleActions = this._operationsToInclude.map(o => {
      const optionalVariables =
        !o.node.variableDefinitions ||
        o.node.variableDefinitions.length === 0 ||
        o.node.variableDefinitions.every(v => v.type.kind !== Kind.NON_NULL_TYPE || v.defaultValue);
      const functionName = o.node.name.value;
      const resultDataTypeName = `${functionName[0].toUpperCase()}${functionName.slice(
        1,
      )}ReturnType`;
      const resultDataType = rawRequest
        ? `{ data?: ${o.operationResultType}, errors?: Array<{ message: string; extensions?: unknown }>, extensions?: unknown }`
        : o.operationResultType;
      return `
export type ${resultDataTypeName} = ${resultDataType}\n
export const ${functionName} = ${pureMagicComment ? '/*#__PURE__*/' : ''}async (variables${
        optionalVariables ? '?' : ''
      }: ${
        o.operationVariablesTypes
      }, options?: GraphQLClientRequestHeaders): Promise<${resultDataTypeName}> => {
  return client.${rawRequest ? 'rawRequest' : 'request'}<${o.operationResultType}, ${
        o.operationVariablesTypes
      }>(${o.documentVariableName}, variables ${
        optionalVariables ? '|| {}' : ''
      }, options) as Promise<${resultDataTypeName}>;
}`;
    });

    return `${allPossibleActions.join('\n')}`;
  }
}
