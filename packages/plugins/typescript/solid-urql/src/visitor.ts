import { GraphQLSchema, Kind, OperationDefinitionNode } from 'graphql';
import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  DocumentMode,
  LoadedFragment,
  RawClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { SolidUrqlPluginConfig } from './config';

/**
 * @description Raw configuration for the SolidJS URQL plugin
 */
export interface SolidUrqlPluginRawConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Whether to generate SolidJS primitives (createQuery, createMutation, createSubscription)
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-solid-urql
   *     config:
   *       withPrimitives: true
   * ```
   */
  withPrimitives?: boolean;
  /**
   * @description The package to import URQL functions from
   * @default "solid-urql"
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-solid-urql
   *     config:
   *       urqlImportFrom: "@urql/solid"
   * ```
   */
  urqlImportFrom?: string;
}

/**
 * @description Visitor class for generating SolidJS URQL hooks from GraphQL operations
 */
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
      urqlImportFrom: rawConfig.urqlImportFrom || 'solid-urql',
      documentMode: DocumentMode.string,
    } as any);

    this._externalImportPrefix = this.config.importOperationTypesFrom
      ? `${this.config.importOperationTypesFrom}.`
      : '';
  }

  /**
   * @description Generates import statements for SolidJS URQL hooks
   * @returns Array of import statements
   */
  public getImports(): string[] {
    const baseImports = super.getImports();
    const imports: string[] = [...baseImports];

    if (this.config.withPrimitives) {
      imports.push(
        `import { createQuery, createMutation, type CreateQueryArgs, type CreateMutationState } from '${this.config.urqlImportFrom}';`,
      );
    }

    imports.push(`import type { Accessor } from 'solid-js';`);
    imports.push(`import type { OperationContext, OperationResult } from '@urql/core';`);

    return imports.filter(Boolean);
  }

  /**
   * @description Builds the appropriate hook based on operation type (Query, Mutation, or Subscription)
   * @param node - The operation definition node
   * @param documentVariableName - The name of the document variable
   * @param operationType - The type of GraphQL operation
   * @param operationResultType - The TypeScript type for the operation result
   * @param operationVariablesTypes - The TypeScript type for the operation variables
   * @param hasRequiredVariables - Whether the operation has required variables
   * @returns The generated hook code
   */
  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string {
    const operationName = this.convertName(node.name?.value || '', {
      useTypesPrefix: false,
      useTypesSuffix: false,
    });

    if (!this.config.withPrimitives) {
      return '';
    }

    if (operationType === 'Query') {
      return this.buildQueryHook(
        node,
        operationName,
        documentVariableName,
        operationResultType,
        operationVariablesTypes,
        hasRequiredVariables,
      );
    } else if (operationType === 'Mutation') {
      return this.buildMutationHook(
        node,
        operationName,
        documentVariableName,
        operationResultType,
        operationVariablesTypes,
        hasRequiredVariables,
      );
    } else if (operationType === 'Subscription') {
      return this.buildSubscriptionHook(
        node,
        operationName,
        documentVariableName,
        operationResultType,
        operationVariablesTypes,
        hasRequiredVariables,
      );
    }

    return '';
  }

  /**
   * @description Generates a SolidJS query hook using createQuery
   */
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

  /**
   * @description Generates a SolidJS mutation hook using createMutation
   */
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

  /**
   * @description Generates a SolidJS subscription hook using createSubscription
   */
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
