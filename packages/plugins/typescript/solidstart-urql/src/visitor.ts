import { GraphQLSchema, Kind, OperationDefinitionNode } from 'graphql';
import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  DocumentMode,
  LoadedFragment,
  RawClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { SolidStartUrqlPluginConfig } from './config';

/**
 * @description Raw configuration for the SolidStart URQL plugin
 */
export interface SolidStartUrqlPluginRawConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Whether to generate SolidStart primitives (query primitives and mutation actions)
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-solidstart-urql
   *     config:
   *       withPrimitives: true
   * ```
   */
  withPrimitives?: boolean;
  /**
   * @description The package to import URQL functions from
   * @default "@urql/solid-start"
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-solidstart-urql
   *     config:
   *       urqlImportFrom: "custom-urql-package"
   * ```
   */
  urqlImportFrom?: string;
}

/**
 * @description Visitor class for generating SolidStart URQL query primitives and actions from GraphQL operations
 */
export class SolidStartUrqlVisitor extends ClientSideBaseVisitor<
  SolidStartUrqlPluginRawConfig,
  SolidStartUrqlPluginConfig
> {
  private _externalImportPrefix: string;

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: SolidStartUrqlPluginRawConfig,
    documents: any[],
  ) {
    super(schema, fragments, rawConfig, {
      withPrimitives: rawConfig.withPrimitives !== false,
      urqlImportFrom: rawConfig.urqlImportFrom || '@urql/solid-start',
      documentMode: DocumentMode.string,
    } as any);

    this._externalImportPrefix = this.config.importOperationTypesFrom
      ? `${this.config.importOperationTypesFrom}.`
      : '';
  }

  /**
   * @description Generates import statements for SolidStart URQL primitives
   * @returns Array of import statements
   */
  public getImports(): string[] {
    const baseImports = super.getImports();
    const imports: string[] = [...baseImports];

    if (this.config.withPrimitives) {
      imports.push(`import { createQuery, createMutation } from '${this.config.urqlImportFrom}';`);
      // Import createSubscription from @urql/solid since it works the same
      imports.push(`import { createSubscription, type CreateQueryArgs } from '@urql/solid';`);
    }

    return imports.filter(Boolean);
  }

  /**
   * @description Builds the appropriate primitive based on operation type (Query, Mutation as action, or Subscription)
   * @param node - The operation definition node
   * @param documentVariableName - The name of the document variable
   * @param operationType - The type of GraphQL operation
   * @param operationResultType - The TypeScript type for the operation result
   * @param operationVariablesTypes - The TypeScript type for the operation variables
   * @param hasRequiredVariables - Whether the operation has required variables
   * @returns The generated primitive code
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
      return this.buildQueryPrimitive(
        node,
        operationName,
        documentVariableName,
        operationResultType,
        operationVariablesTypes,
        hasRequiredVariables,
      );
    } else if (operationType === 'Mutation') {
      return this.buildMutationPrimitive(
        node,
        operationName,
        documentVariableName,
        operationResultType,
        operationVariablesTypes,
        hasRequiredVariables,
      );
    } else if (operationType === 'Subscription') {
      return this.buildSubscriptionPrimitive(
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
   * @description Generates a SolidStart query primitive using createQuery
   */
  private buildQueryPrimitive(
    node: OperationDefinitionNode,
    operationName: string,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string {
    const functionName = `query${operationName}`;
    const kebabCaseKey = operationName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .substring(1);

    return `
export const ${functionName} = createQuery<${operationResultType}, ${operationVariablesTypes}>(
  ${documentVariableName},
  '${kebabCaseKey}'
);
`;
  }

  /**
   * @description Generates a SolidStart mutation action using createMutation
   */
  private buildMutationPrimitive(
    node: OperationDefinitionNode,
    operationName: string,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string {
    const functionName = `action${operationName}`;
    const kebabCaseKey = operationName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .substring(1);

    return `
export const ${functionName} = () => createMutation<${operationResultType}, ${operationVariablesTypes}>(
  ${documentVariableName},
  '${kebabCaseKey}'
);
`;
  }

  /**
   * @description Generates a SolidStart subscription hook using createSubscription
   */
  private buildSubscriptionPrimitive(
    node: OperationDefinitionNode,
    operationName: string,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean,
  ): string {
    const functionName = `useSubscription${operationName}`;

    const argsType = hasRequiredVariables
      ? `Omit<CreateQueryArgs<${operationVariablesTypes}, ${operationResultType}>, 'query'>`
      : `Omit<CreateQueryArgs<${operationVariablesTypes}, ${operationResultType}>, 'query'> = {}`;

    return `
export const ${functionName} = (args: ${argsType}) => {
  return createSubscription<${operationResultType}, ${operationVariablesTypes}>({
    ...args,
    query: ${documentVariableName},
  });
};
`;
  }
}
