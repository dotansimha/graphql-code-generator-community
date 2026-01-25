import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  LoadedFragment,
  DocumentMode,
  RawClientSideBasePluginConfig,
} from "@graphql-codegen/visitor-plugin-common";
import { GraphQLSchema, OperationDefinitionNode, Kind } from "graphql";
import { SolidStartUrqlPluginConfig } from "./config";

export interface SolidStartUrqlPluginRawConfig
  extends RawClientSideBasePluginConfig {
  withPrimitives?: boolean;
  urqlImportFrom?: string;
}

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
      urqlImportFrom: rawConfig.urqlImportFrom || "@urql/solid-start",
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
        `import { createQuery, createMutation } from '${this.config.urqlImportFrom}';`,
      );
      // Import createSubscription from @urql/solid since it works the same
      imports.push(
        `import { createSubscription, type CreateQueryArgs } from '@urql/solid';`,
      );
    }

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
      return this.buildQueryPrimitive(
        node,
        operationName,
        documentVariableName,
        operationResultType,
        operationVariablesTypes,
        hasRequiredVariables,
      );
    } else if (operationType === "Mutation") {
      return this.buildMutationPrimitive(
        node,
        operationName,
        documentVariableName,
        operationResultType,
        operationVariablesTypes,
        hasRequiredVariables,
      );
    } else if (operationType === "Subscription") {
      return this.buildSubscriptionPrimitive(
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
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()
      .substring(1);

    return `
export const ${functionName} = createQuery<${operationResultType}, ${operationVariablesTypes}>(
  ${documentVariableName},
  '${kebabCaseKey}'
);
`;
  }

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
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()
      .substring(1);

    return `
export const ${functionName} = () => createMutation<${operationResultType}, ${operationVariablesTypes}>(
  ${documentVariableName},
  '${kebabCaseKey}'
);
`;
  }

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
