import { DocumentNode, FragmentDefinitionNode, GraphQLSchema, Kind, print } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import {
  BaseVisitor,
  buildScalarsFromConfig,
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
    imports: Array<FragmentImport>;
    possibleTypes: string[];
  };
};

/**
 * Creates fragment imports based on possible types and usage
 */
function createFragmentImports(
  baseVisitor: BaseVisitor<RawConfig, NearOperationFileParsedConfig>,
  fragmentName: string,
  possibleTypes: string[],
  usedTypes?: string[],
): Array<FragmentImport> {
  const fragmentImports: Array<FragmentImport> = [];

  // Always include the document import
  fragmentImports.push({
    name: baseVisitor.getFragmentVariableName(fragmentName),
    kind: 'document',
  });

  const fragmentSuffix = baseVisitor.getFragmentSuffix(fragmentName);

  if (possibleTypes.length === 1) {
    fragmentImports.push({
      name: baseVisitor.convertName(fragmentName, {
        useTypesPrefix: true,
        suffix: fragmentSuffix,
      }),
      kind: 'type',
    });
  } else if (possibleTypes.length > 0) {
    const typesToImport = usedTypes && usedTypes.length > 0 ? usedTypes : possibleTypes;

    typesToImport.forEach(typeName => {
      fragmentImports.push({
        name: baseVisitor.convertName(fragmentName, {
          useTypesPrefix: true,
          suffix: `_${typeName}` + (fragmentSuffix.length > 0 ? `_${fragmentSuffix}` : ''),
        }),
        kind: 'type',
      });
    });
  }

  return fragmentImports;
}

/**
 * Used by `buildFragmentResolver` to build a mapping of fragmentNames to paths, importNames, and other useful info
 */
function buildFragmentRegistry(
  baseVisitor: BaseVisitor<RawConfig, NearOperationFileParsedConfig>,
  { generateFilePath }: DocumentImportResolverOptions,
  { documents }: Types.PresetFnArgs<{}>,
  schemaObject: GraphQLSchema,
): FragmentRegistry {
  const duplicateFragmentNames: string[] = [];
  const registry = documents.reduce<FragmentRegistry>((prev: FragmentRegistry, documentRecord) => {
    const fragments: FragmentDefinitionNode[] = documentRecord.document.definitions.filter(
      d => d.kind === Kind.FRAGMENT_DEFINITION,
    ) as FragmentDefinitionNode[];

    for (const fragment of fragments) {
      const schemaType = schemaObject.getType(fragment.typeCondition.name.value);

      if (!schemaType) {
        throw new Error(
          `Fragment "${fragment.name.value}" is set on non-existing type "${fragment.typeCondition.name.value}"!`,
        );
      }

      const fragmentName = fragment.name.value;
      const filePath = generateFilePath(documentRecord.location);
      const possibleTypes = getPossibleTypes(schemaObject, schemaType);
      const possibleTypeNames = possibleTypes.map(t => t.name);
      const imports = createFragmentImports(baseVisitor, fragment.name.value, possibleTypeNames);

      if (prev[fragmentName] && print(fragment) !== print(prev[fragmentName].node)) {
        duplicateFragmentNames.push(fragmentName);
      }

      prev[fragmentName] = {
        filePath,
        imports,
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
  const fragmentRegistry = buildFragmentRegistry(
    baseVisitor,
    collectorOptions,
    presetOptions,
    schemaObject,
  );
  const { baseOutputDir } = presetOptions;
  const { baseDir, typesImport } = collectorOptions;

  function resolveFragments(generatedFilePath: string, documentFileContent: DocumentNode) {
    const { fragmentsInUse, usedFragmentTypes } = analyzeFragmentUsage(
      documentFileContent,
      fragmentRegistry,
      schemaObject,
    );

    const externalFragments: LoadedFragment<{ level: number }>[] = [];
    const fragmentFileImports: { [fragmentFile: string]: Array<FragmentImport> } = {};

    for (const [fragmentName, level] of Object.entries(fragmentsInUse)) {
      const fragmentDetails = fragmentRegistry[fragmentName];

      if (!fragmentDetails) continue;

      // add top level references to the import object
      // we don't check or global namespace because the calling config can do so
      if (
        level === 0 ||
        (dedupeFragments &&
          ['OperationDefinition', 'FragmentDefinition'].includes(
            documentFileContent.definitions[0].kind,
          ))
      ) {
        if (fragmentDetails.filePath !== generatedFilePath) {
          // don't emit imports to same location
          const usedTypesForFragment = usedFragmentTypes[fragmentName] || [];
          const filteredImports = createFragmentImports(
            baseVisitor,
            fragmentName,
            fragmentDetails.possibleTypes,
            usedTypesForFragment,
          );

          if (!fragmentFileImports[fragmentDetails.filePath]) {
            fragmentFileImports[fragmentDetails.filePath] = [];
          }
          fragmentFileImports[fragmentDetails.filePath].push(...filteredImports);
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
