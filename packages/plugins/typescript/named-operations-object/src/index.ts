import { capitalCase } from 'change-case-all';
import { concatAST, GraphQLSchema } from 'graphql';
import { oldVisit, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';

export interface NamedOperationsObjectPluginConfig {
  /**
   * @description Allow you to customize the name of the exported identifier
   * @default namedOperations
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - named-operations-object
   *     config:
   *       identifierName: ListAllOperations
   * ```
   */
  identifierName?: string;
  /**
   * @description Will generate a const string instead of regular string.
   * @default false
   */
  useConsts?: boolean;
  /**
   * @description Throws an error if a duplicate operation name is found.
   * @default false
   */
  throwOnDuplicate?: boolean;
}

export const plugin: PluginFunction<NamedOperationsObjectPluginConfig, string> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: NamedOperationsObjectPluginConfig,
) => {
  const identifierName = config.identifierName || 'namedOperations';
  const allAst = concatAST(documents.map(v => v.document));
  const allOperationsNames: Record<
    'query' | 'mutation' | 'subscription' | 'fragment',
    Set<string>
  > = {
    query: new Set(),
    mutation: new Set(),
    subscription: new Set(),
    fragment: new Set(),
  };

  const duplicateOperationNames = [];

  oldVisit(allAst, {
    enter: {
      OperationDefinition: node => {
        if (node.name?.value) {
          if (allOperationsNames[node.operation].has(node.name.value)) {
            duplicateOperationNames.push(node.name.value);
            return;
          }
          allOperationsNames[node.operation].add(node.name.value);
        }
      },
      FragmentDefinition: node => {
        allOperationsNames.fragment.add(node.name.value);
      },
    },
  });

  if (config.throwOnDuplicate && duplicateOperationNames.length > 0) {
    throw new Error(`Duplicated operation name(s): ${duplicateOperationNames.join(', ')}`);
  }

  const objectItems = Object.keys(allOperationsNames)
    .map(operationType => {
      const relevantOperations: Set<string> = allOperationsNames[operationType];

      if (relevantOperations && relevantOperations.size > 0) {
        const rootFieldName = capitalCase(operationType);

        return `  ${rootFieldName}: {
${Array.from(relevantOperations)
  .map(t => `    ${t}: '${t}'${config.useConsts ? ' as const' : ''}`)
  .join(',\n')}
  }`;
      }

      return null;
    })
    .filter(Boolean);

  if (objectItems.length === 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `Plugin "named-operations-object" has an empty output, since there are no valid operations!`,
    );

    return '';
  }

  return `export const ${identifierName} = {
${objectItems.join(',\n')}
}`;
};
