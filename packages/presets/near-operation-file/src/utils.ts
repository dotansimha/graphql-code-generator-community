import { join } from 'path';
import {
  DocumentNode,
  FieldNode,
  FragmentDefinitionNode,
  GraphQLSchema,
  GraphQLType,
  isInterfaceType,
  isObjectType,
  isUnionType,
  Kind,
  OperationDefinitionNode,
  SelectionSetNode,
  TypeInfo,
  visit,
  visitWithTypeInfo,
} from 'graphql';
import parsePath from 'parse-filepath';
import { getPossibleTypes, separateSelectionSet } from '@graphql-codegen/visitor-plugin-common';
import { FragmentRegistry } from './fragment-resolver.js';

export function defineFilepathSubfolder(baseFilePath: string, folder: string) {
  const parsedPath = parsePath(baseFilePath);
  return join(parsedPath.dir, folder, parsedPath.base).replace(/\\/g, '/');
}

export function appendFileNameToFilePath(
  baseFilePath: string,
  fileName: string,
  extension: string,
) {
  const parsedPath = parsePath(baseFilePath);
  const name = fileName || parsedPath.name;
  return join(parsedPath.dir, name + extension).replace(/\\/g, '/');
}

/**
 * Analyzes fragment usage in a GraphQL document.
 * Returns information about which fragments are used and which specific types they're used with.
 */
export function analyzeFragmentUsage(
  documentNode: DocumentNode,
  fragmentRegistry: FragmentRegistry,
  schema: GraphQLSchema,
): {
  fragmentsInUse: { [fragmentName: string]: number };
  usedFragmentTypes: { [fragmentName: string]: string[] };
  operationFragments: Set<string>;
} {
  const localFragments = getLocalFragments(documentNode);

  const fragmentsInUse = extractExternalFragmentsInUse(
    documentNode,
    fragmentRegistry,
    localFragments,
  );

  const usedFragmentTypes = analyzeFragmentTypeUsage(
    documentNode,
    fragmentRegistry,
    schema,
    localFragments,
    fragmentsInUse,
  );

  const operationFragments = collectOperationFragments(
    documentNode,
    fragmentRegistry,
    localFragments,
  );

  return { fragmentsInUse, usedFragmentTypes, operationFragments };
}

/**
 * External fragments transitively reachable from the document's operations (graphQLTag operations
 * interpolate all of these). Steps through local fragments too, since an operation may reach an
 * external fragment via a local one.
 */
function collectOperationFragments(
  documentNode: DocumentNode,
  fragmentRegistry: FragmentRegistry,
  localFragments: Map<string, FragmentDefinitionNode>,
): Set<string> {
  const reachable = new Set<string>();
  const visited = new Set<string>();

  const collect = (node: OperationDefinitionNode | FragmentDefinitionNode): void => {
    visit(node, {
      FragmentSpread: ({ name: { value } }) => {
        if (fragmentRegistry[value]) reachable.add(value);
        if (visited.has(value)) return;
        visited.add(value);
        const fragmentNode = fragmentRegistry[value]?.node ?? localFragments.get(value);
        if (fragmentNode) collect(fragmentNode);
      },
    });
  };

  for (const definition of documentNode.definitions) {
    if (definition.kind === Kind.OPERATION_DEFINITION) collect(definition);
  }

  return reachable;
}

/**
 * Get all fragment definitions that are local to this document, keyed by name
 */
function getLocalFragments(documentNode: DocumentNode): Map<string, FragmentDefinitionNode> {
  const localFragments = new Map<string, FragmentDefinitionNode>();
  visit(documentNode, {
    FragmentDefinition: node => {
      localFragments.set(node.name.value, node);
    },
  });
  return localFragments;
}

function extractExternalFragmentsInUse(
  documentNode: DocumentNode | FragmentDefinitionNode,
  fragmentNameToFile: FragmentRegistry,
  localFragment: Map<string, FragmentDefinitionNode>,
  result: { [fragmentName: string]: number } = {},
  level = 0,
): { [fragmentName: string]: number } {
  // Then, look for all used fragments in this document
  visit(documentNode, {
    FragmentSpread: node => {
      if (
        !localFragment.has(node.name.value) &&
        (result[node.name.value] === undefined || level < result[node.name.value])
      ) {
        result[node.name.value] = level;

        if (fragmentNameToFile[node.name.value]) {
          extractExternalFragmentsInUse(
            fragmentNameToFile[node.name.value].node,
            fragmentNameToFile,
            localFragment,
            result,
            level + 1,
          );
        }
      }
    },
  });

  return result;
}

/**
 * Analyze which specific types each fragment is used with (for polymorphic fragments)
 */
function analyzeFragmentTypeUsage(
  documentNode: DocumentNode,
  fragmentRegistry: FragmentRegistry,
  schema: GraphQLSchema,
  localFragments: Map<string, FragmentDefinitionNode>,
  fragmentsInUse: { [fragmentName: string]: number },
): { [fragmentName: string]: string[] } {
  const usedFragmentTypes: { [fragmentName: string]: Set<string> } = {};
  const typeInfo = new TypeInfo(schema);

  visit(
    documentNode,
    visitWithTypeInfo(typeInfo, {
      Field: (node: FieldNode) => {
        if (!node.selectionSet) return;

        const fieldType = typeInfo.getType();
        if (!fieldType) return;

        const baseType = getBaseType(fieldType);
        if (isObjectType(baseType) || isInterfaceType(baseType) || isUnionType(baseType)) {
          analyzeSelectionSetTypeContext(
            node.selectionSet,
            baseType.name,
            usedFragmentTypes,
            fragmentRegistry,
            schema,
            localFragments,
          );
        }
      },
    }),
  );

  const result: { [fragmentName: string]: string[] } = {};

  // Fill in missing types for multi-type fragments
  for (const fragmentName in fragmentsInUse) {
    const fragment = fragmentRegistry[fragmentName];
    if (!fragment || fragment.possibleTypes.length <= 1) continue;

    const usedTypes = usedFragmentTypes[fragmentName];
    result[fragmentName] = usedTypes?.size > 0 ? Array.from(usedTypes) : fragment.possibleTypes;
  }

  return result;
}

/**
 * Analyze fragment usage within a specific selection set and type context
 */
function analyzeSelectionSetTypeContext(
  selectionSet: SelectionSetNode,
  currentTypeName: string,
  usedFragmentTypes: { [fragmentName: string]: Set<string> },
  fragmentRegistry: FragmentRegistry,
  schema: GraphQLSchema,
  localFragments: Map<string, FragmentDefinitionNode>,
): void {
  const { spreads, inlines } = separateSelectionSet(selectionSet.selections);

  // Process fragment spreads in this type context
  for (const spread of spreads) {
    if (localFragments.has(spread.name.value)) continue;

    const fragment = fragmentRegistry[spread.name.value];
    if (!fragment || fragment.possibleTypes.length <= 1) continue;

    const currentType = schema.getType(currentTypeName);
    if (!currentType) continue;

    const possibleTypes = getPossibleTypes(schema, currentType).map(t => t.name);
    const matchingTypes = possibleTypes.filter(type => fragment.possibleTypes.includes(type));

    if (matchingTypes.length > 0) {
      const typeSet = (usedFragmentTypes[spread.name.value] ??= new Set());
      matchingTypes.forEach(type => typeSet.add(type));
    }
  }

  // Process inline fragments
  for (const inline of inlines) {
    if (inline.typeCondition?.name.value && inline.selectionSet) {
      analyzeSelectionSetTypeContext(
        inline.selectionSet,
        inline.typeCondition.name.value,
        usedFragmentTypes,
        fragmentRegistry,
        schema,
        localFragments,
      );
    }
  }
}

function getBaseType(type: GraphQLType): GraphQLType {
  let baseType = type;
  while ('ofType' in baseType && baseType.ofType) {
    baseType = baseType.ofType;
  }
  return baseType;
}
