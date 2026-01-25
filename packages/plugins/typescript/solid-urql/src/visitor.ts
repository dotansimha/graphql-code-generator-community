import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  LoadedFragment,
  DocumentMode,
  RawClientSideBasePluginConfig,
} from "@graphql-codegen/visitor-plugin-common";
import { GraphQLSchema, OperationDefinitionNode, Kind } from "graphql";
import { SolidUrqlPluginConfig } from "./config";

export interface SolidUrqlPluginRawConfig
  extends RawClientSideBasePluginConfig {
  withPrimitives?: boolean;
  urqlImportFrom?: string;
}

export class SolidUrqlVisitor extends ClientSideBaseVisitor<
  SolidUrqlPluginRawConfig,
  SolidUrqlPluginConfig
> {
  private _externalImportPrefix: string;

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: SolidUrqlPluginRawConfig,
    documents: any[],
  ) {
    super(schema, fragments, rawConfig, {
      withPrimitives: rawConfig.withPrimitives !== false,
      urqlImportFrom: rawConfig.urqlImportFrom || "solid-urql",
      documentMode: DocumentMode.string,
    } as any);

    this._externalImportPrefix = this.config.importOperationTypesFrom
      ? `${this.config.importOperationTypesFrom}.`
      : "";
  }

  public getImports(): string[] {
    const baseImports = super.getImports();
    const imports: string[] = [...baseImports];

    if (this.config.withPrimitives) {
      imports.push(
        `import { createQuery, createMutation, type CreateQueryArgs, type CreateMutationState } from '${this.config.urqlImportFrom}';`,
      );
    }

    imports.push(`import type { Accessor } from 'solid-js';`);
    imports.push(
      `import type { OperationContext, OperationResult } from '@urql/core';`,
    );

    return imports.filter(Boolean);
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string {
    const operationName = this.convertName(node.name?.value || "", {
      useTypesPrefix: false,
      useTypesSuffix: false,
    });

    if (!this.config.withPrimitives) {
      return "";
    }

    if (operationType === "Query") {
      return this.buildQueryHook(
        node,
        operationName,
        documentVariableName,
        operationResultType,
        operationVariablesTypes,
        hasRequiredVariables,
      );
    } else if (operationType === "Mutation") {
      return this.buildMutationHook(
        node,
        operationName,
        documentVariableName,
        operationResultType,
        operationVariablesTypes,
        hasRequiredVariables,
      );
    } else if (operationType === "Subscription") {
      return this.buildSubscriptionHook(
        node,
        operationName,
        documentVariableName,
        operationResultType,
        operationVariablesTypes,
        hasRequiredVariables,
      );
    }

    return "";
  }

  private buildQueryHook(
    node: OperationDefinitionNode,
    operationName: string,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string {
    const hookName = `useCreate${operationName}`;

    const argsType = hasRequiredVariables
      ? `Omit<CreateQueryArgs<${operationVariablesTypes}, ${operationResultType}>, 'query'>`
      : `Omit<CreateQueryArgs<${operationVariablesTypes}, ${operationResultType}>, 'query'> = {}`;

    return `
export const ${hookName} = (args: ${argsType}) => {
  return createQuery<${operationResultType}, ${operationVariablesTypes}>({
    ...args,
    query: ${documentVariableName},
  });
};
`;
  }

  private buildMutationHook(
    node: OperationDefinitionNode,
    operationName: string,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string {
    const hookName = `useCreate${operationName}`;

    return `
export const ${hookName} = () => {
  return createMutation<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName});
};
`;
  }

  private buildSubscriptionHook(
    node: OperationDefinitionNode,
    operationName: string,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string {
    const hookName = `useCreate${operationName}`;

    const argsType = hasRequiredVariables
      ? `Omit<CreateQueryArgs<${operationVariablesTypes}, ${operationResultType}>, 'query'>`
      : `Omit<CreateQueryArgs<${operationVariablesTypes}, ${operationResultType}>, 'query'> = {}`;

    return `
export const ${hookName} = (args: ${argsType}) => {
  return createSubscription<${operationResultType}, ${operationVariablesTypes}>({
    ...args,
    query: ${documentVariableName},
  });
};
`;
  }
}
