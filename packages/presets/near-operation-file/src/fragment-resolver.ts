import { DocumentNode, FragmentDefinitionNode, GraphQLSchema, Kind, print } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import {
  BaseVisitor,
  buildScalarsFromConfig,
  DocumentMode,
  FragmentImport,
  getConfigValue,
  getPossibleTypes,
  ImportDeclaration,
  LoadedFragment,
  ParsedConfig,
  RawConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { DocumentImportResolverOptions } from './resolve-document-imports.js';
import { analyzeFragmentUsage } from './utils.js';

export interface NearOperationFileParsedConfig extends ParsedConfig {
  importTypesNamespace?: string;
  dedupeOperationSuffix: boolean;
  omitOperationSuffix: boolean;
  fragmentVariablePrefix: string;
  fragmentVariableSuffix: string;
}

export type FragmentRegistry = {
  [fragmentName: string]: {
    filePath: string;
    onType: string;
    node: FragmentDefinitionNode;
    possibleTypes: string[];
  };
};

/**
 * Creates a fragment's type imports based on possible types and usage
 */
function createFragmentTypeImports(
  baseVisitor: BaseVisitor<RawConfig, NearOperationFileParsedConfig>,
  fragmentName: string,
  possibleTypes: string[],
  usedTypes?: string[],
): Array<FragmentImport> {
  const fragmentSuffix = baseVisitor.getFragmentSuffix(fragmentName);

  if (possibleTypes.length === 1) {
    return [
      {
        name: baseVisitor.convertName(fragmentName, {
          useTypesPrefix: true,
          suffix: fragmentSuffix,
        }),
        kind: 'type',
      },
    ];
  }

  if (possibleTypes.length > 0) {
    const typesToImport = usedTypes && usedTypes.length > 0 ? usedTypes : possibleTypes;

    return typesToImport.map(typeName => ({
      name: baseVisitor.convertName(fragmentName, {
        useTypesPrefix: true,
        suffix: `_${typeName}` + (fragmentSuffix.length > 0 ? `_${fragmentSuffix}` : ''),
      }),
      kind: 'type',
    }));
  }

  return [];
}

/**
 * Used by `buildFragmentResolver` to build a mapping of fragmentNames to paths, nodes, and other useful info
 */
function buildFragmentRegistry(
  { generateFilePath }: DocumentImportResolverOptions,
  { documents }: Types.PresetFnArgs<{}>,
  schemaObject: GraphQLSchema,
): FragmentRegistry {
  const duplicateFragmentNames: string[] = [];
  const registry = documents.reduce<FragmentRegistry>((prev: FragmentRegistry, documentRecord) => {
    const fragments: FragmentDefinitionNode[] = documentRecord.document.definitions.filter(
      d => d.kind === Kind.FRAGMENT_DEFINITION,
    );

    for (const fragment of fragments) {
      const schemaType = schemaObject.getType(fragment.typeCondition.name.value);

      if (!schemaType) {
        throw new Error(
          `Fragment "${fragment.name.value}" is set on non-existing type "${fragment.typeCondition.name.value}"!`,
        );
      }

      const filePath = generateFilePath({
        location: documentRecord.location,
        meta: { operations: [], fragments: [fragment] },
      });

      const fragmentName = fragment.name.value;
      const possibleTypes = getPossibleTypes(schemaObject, schemaType);
      const possibleTypeNames = possibleTypes.map(t => t.name);

      if (prev[fragmentName] && print(fragment) !== print(prev[fragmentName].node)) {
        duplicateFragmentNames.push(fragmentName);
      }

      prev[fragmentName] = {
        filePath,
        onType: fragment.typeCondition.name.value,
        node: fragment,
        possibleTypes: possibleTypeNames,
      };
    }

    return prev;
  }, {});

  if (duplicateFragmentNames.length) {
    throw new Error(
      `Multiple fragments with the name(s) "${duplicateFragmentNames.join(', ')}" were found.`,
    );
  }

  return registry;
}

/**
 * Creates a BaseVisitor with standard configuration
 */
function createBaseVisitor(
  config: { [key: string]: any },
  schemaObject: GraphQLSchema,
): BaseVisitor<RawConfig, NearOperationFileParsedConfig> {
  return new BaseVisitor<RawConfig, NearOperationFileParsedConfig>(config, {
    scalars: buildScalarsFromConfig(schemaObject, config),
    dedupeOperationSuffix: getConfigValue(config.dedupeOperationSuffix, false),
    omitOperationSuffix: getConfigValue(config.omitOperationSuffix, false),
    fragmentVariablePrefix: getConfigValue(config.fragmentVariablePrefix, ''),
    fragmentVariableSuffix: getConfigValue(config.fragmentVariableSuffix, 'FragmentDoc'),
  });
}

/**
 * Builds a fragment "resolver" that collects `externalFragments` definitions and `fragmentImportStatements`
 */
export default function buildFragmentResolver<T>(
  collectorOptions: DocumentImportResolverOptions,
  presetOptions: Types.PresetFnArgs<T>,
  schemaObject: GraphQLSchema,
  dedupeFragments = false,
) {
  const { config } = presetOptions;
  const baseVisitor = createBaseVisitor(config, schemaObject);
  const fragmentRegistry = buildFragmentRegistry(collectorOptions, presetOptions, schemaObject);
  const { baseOutputDir } = presetOptions;
  const { baseDir, typesImport } = collectorOptions;

  function resolveFragments(generatedFilePath: string, documentFileContent: DocumentNode) {
    const { fragmentsInUse, usedFragmentTypes, operationFragments } = analyzeFragmentUsage(
      documentFileContent,
      fragmentRegistry,
      schemaObject,
    );

    // graphQLTag operations inline every fragment they transitively spread
    const { documentMode = DocumentMode.graphQLTag } = config;
    const isGraphQLTagMode = documentMode === DocumentMode.graphQLTag;

    const externalFragments: LoadedFragment<{ level: number }>[] = [];
    const fragmentFileImports: { [fragmentFile: string]: Array<FragmentImport> } = {};

    for (const [fragmentName, level] of Object.entries(fragmentsInUse)) {
      const fragmentDetails = fragmentRegistry[fragmentName];

      if (!fragmentDetails) continue;

      // don't emit imports to the same location
      if (fragmentDetails.filePath !== generatedFilePath) {
        const imports: FragmentImport[] = [];
        const isSpreadDirectly = level === 0 || dedupeFragments;

        const needsDocument = isGraphQLTagMode
          ? operationFragments.has(fragmentName)
          : isSpreadDirectly;

        if (needsDocument) {
          imports.push({
            name: baseVisitor.getFragmentVariableName(fragmentName),
            kind: 'document',
          });
        }

        if (isSpreadDirectly) {
          imports.push(
            ...createFragmentTypeImports(
              baseVisitor,
              fragmentName,
              fragmentDetails.possibleTypes,
              usedFragmentTypes[fragmentName] || [],
            ),
          );
        }

        if (imports.length > 0) {
          (fragmentFileImports[fragmentDetails.filePath] ??= []).push(...imports);
        }
      }

      externalFragments.push({
        level,
        isExternal: true,
        name: fragmentName,
        onType: fragmentDetails.onType,
        node: fragmentDetails.node,
      });
    }

    return {
      externalFragments,
      fragmentImports: Object.entries(fragmentFileImports).map(
        ([fragmentsFilePath, identifiers]): ImportDeclaration<FragmentImport> => ({
          baseDir,
          baseOutputDir,
          outputPath: generatedFilePath,
          importSource: {
            path: fragmentsFilePath,
            identifiers,
          },
          emitLegacyCommonJSImports: presetOptions.config.emitLegacyCommonJSImports,
          importExtension: presetOptions.config.importExtension,
          typesImport,
        }),
      ),
    };
  }

  return resolveFragments;
}
