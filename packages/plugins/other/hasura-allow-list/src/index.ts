import {
  DefinitionNode,
  ExecutableDefinitionNode,
  FragmentDefinitionNode,
  GraphQLSchema,
  Kind,
  OperationDefinitionNode,
  print,
  visit,
} from 'graphql';
import yaml from 'yaml';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { HasuraAllowListPluginConfig } from './config.js';

/**
 * Returns an array of fragments required for a given operation, recursively.
 * Will throw an error if it cannot find one of the fragments required for the operation.
 * @param operationDefinition the operation we want to find fragements for.
 * @param fragmentDefinitions a list of fragments from the same document, some of which may be required by the operation.
 * @param documentLocation location of the document the operation is sourced from. Only used to improve error messages.
 * @returns an array of fragments required for the operation.
 */
function getOperationFragmentsRecursively(
  operationDefinition: OperationDefinitionNode,
  fragmentDefinitions: FragmentDefinitionNode[],
  documentLocation: string,
  config: HasuraAllowListPluginConfig,
): FragmentDefinitionNode[] {
  const requiredFragments: { name: string; key: string | number }[] = [];

  getRequiredFragments(operationDefinition);

  // note: we should choose fragmentsOrder config that is compatible with other graphql-codegen plugins we use.
  const order = config.fragmentsOrder ?? 'global';

  // order of fragments is determined by the order they are defined in the document.
  if (order === 'document') {
    return requiredFragments
      .sort((a, b) => (a.key === b.key ? 0 : a.key < b.key ? -1 : 1))
      .map(({ name }) => fragmentDefinitions.find(definition => definition.name.value === name));
  }

  //  order is determined by the global fragments definition order.
  return fragmentDefinitions.filter(definition =>
    requiredFragments.map(({ name }) => name).includes(definition.name.value),
  );

  /**
   * Given a definition adds required fragments to requieredFragmentsNames, recursively.
   * @param definition either an operation definition or a fragment definition.
   */
  function getRequiredFragments(definition: ExecutableDefinitionNode) {
    visit(definition, {
      FragmentSpread(fragmentSpreadNode, key) {
        const fragmentName = fragmentSpreadNode.name.value;

        // added this check to prevent infinite recursion on recursive fragment definition (which itself isn't legal graphql)
        // it seems graphql crashes anyways if a recursive fragment is defined, so maybe remove this check?
        if (!requiredFragments.some(fragment => fragment.name === fragmentName)) {
          requiredFragments.push({ name: fragmentName, key });

          const fragmentDefinition = fragmentDefinitions.find(
            definition => definition.name.value === fragmentName,
          );

          if (!fragmentDefinition) {
            throw new Error(
              `Missing fragment ${fragmentSpreadNode.name.value} for ${
                definition.kind === Kind.FRAGMENT_DEFINITION ? 'fragment' : 'operation'
              } ${definition.name.value} in file ${documentLocation}`,
            );
          } else {
            getRequiredFragments(fragmentDefinition);
          }
        }
        return fragmentSpreadNode;
      },
    });
  }
}

/**
 * Gets a list of fragments from all documents. Will enforce fragment name uniqueness
 * @param documents All the documents from which fragments will be extracted
 * @returns global fragment definitions, guaranteed to have unique names
 */
function getGlobalFragments(documents: Types.DocumentFile[]): FragmentDefinitionNode[] {
  // keep a dictionary of each fragment and its location for better error messages
  const fragmentDictionary = new Map<string, string>();

  // iterate over each document's fragments, and add them to the map
  for (const document of documents) {
    const fragmentDefinitions = document.document.definitions.filter(namedFragmentDefinitionFilter);
    for (const fragment of fragmentDefinitions) {
      const fragmentName = fragment.name.value;
      // if the map already has a fragment by that name, throw an error with locations for both definitions
      if (fragmentDictionary.has(fragment.name.value)) {
        const locationA = document.location;
        const locationB = fragmentDictionary.get(fragmentName);
        throw new Error(
          `Duplicate fragment definitions for ${fragmentName} in files ${locationA}, ${locationB}`,
        );
      }
      fragmentDictionary.set(fragmentName, document.location);
    }
  }

  return documents.flatMap(document =>
    document.document.definitions.filter(namedFragmentDefinitionFilter),
  );
}

function getDocumentFragments(document: Types.DocumentFile): FragmentDefinitionNode[] {
  return document.document.definitions.filter(namedFragmentDefinitionFilter);
}

function namedOperationDefinitionFilter(
  definition: DefinitionNode,
): definition is OperationDefinitionNode {
  return definition.kind === Kind.OPERATION_DEFINITION && !!definition.name;
}
function namedFragmentDefinitionFilter(
  definition: DefinitionNode,
): definition is FragmentDefinitionNode {
  return definition.kind === Kind.FRAGMENT_DEFINITION && !!definition.name;
}

export const plugin: PluginFunction<HasuraAllowListPluginConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: HasuraAllowListPluginConfig,
): Promise<Types.PluginOutput> => {
  if ('config_version' in config) {
    throw new Error(
      `[hasura allow list plugin] Configuration error: configuration property config_version has been renamed configVersion. Please update your configuration accordingly.`,
    );
  }

  if ('collection_name' in config) {
    throw new Error(
      `[hasura allow list plugin] Configuration error: configuration property collection_name has been renamed collectionName. Please update your configuration accordingly.`,
    );
  }

  const queries: { name: string; query: string }[] = [];

  // if config globalFragments is set, get fragments from all documents
  const globalFragments = !config.globalFragments ? false : getGlobalFragments(documents);

  for (const document of documents) {
    // filter out anonymous operations
    const documentOperations = document.document.definitions.filter(namedOperationDefinitionFilter);

    // depending on globalFragments settings, either use document level or global level fragments
    const fragments = globalFragments || getDocumentFragments(document);

    // for each operation in the document
    for (const operation of documentOperations) {
      // get fragments required by the operations
      const requiredFragmentDefinitions = getOperationFragmentsRecursively(
        operation,
        fragments,
        document.location,
        config,
      );

      // insert the operation and any fragments to our queries definition.
      // fragment order is preserved, and each fragment is separated by a new line
      queries.push({
        name: operation.name.value,
        query: [operation, ...requiredFragmentDefinitions].map(print).join('\n'),
      });
    }
  }

  return yaml.stringify([
    {
      name: config.collectionName ?? 'allowed-queries',
      definition: {
        queries,
      },
    },
  ]);
};

export default { plugin };
