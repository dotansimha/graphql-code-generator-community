import { join } from 'path';
import { buildASTSchema, DocumentNode, FragmentDefinitionNode, GraphQLSchema, Kind } from 'graphql';
import addPlugin from '@graphql-codegen/add';
import { CodegenPlugin, Types } from '@graphql-codegen/plugin-helpers';
import {
  FragmentImport,
  getConfigValue,
  ImportDeclaration,
  ImportSource,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import type { Source } from '@graphql-tools/utils';
import {
  DocumentImportResolverOptions,
  resolveDocumentImports,
} from './resolve-document-imports.js';
import { appendFileNameToFilePath, defineFilepathSubfolder } from './utils.js';
import { generateDocumentHash, normalizeAndPrintDocumentNode } from './persisted-documents.js';

export { resolveDocumentImports, DocumentImportResolverOptions };

export type FragmentImportFromFn = (
  source: ImportSource<FragmentImport>,
  sourceFilePath: string,
) => ImportSource<FragmentImport>;

export type NearOperationFileConfig = {
  /**
   * @description Required, should point to the base schema types file.
   * The key of the output is used a the base path for this file.
   *
   * If you wish to use an NPM package or a local workspace package, make sure to prefix the package name with `~`.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts" {10}
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        preset: 'near-operation-file',
   *        plugins: ['typescript-operations'],
   *        presetConfig: {
   *          baseTypesPath: 'types.ts'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  baseTypesPath: string;
  /**
   * @description Overrides all external fragments import types by using a specific file path or a package name.
   *
   * If you wish to use an NPM package or a local workspace package, make sure to prefix the package name with `~`.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts" {11}
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        preset: 'near-operation-file',
   *        plugins: ['typescript-operations'],
   *        presetConfig: {
   *          baseTypesPath: 'types.ts',
   *          importAllFragmentsFrom: '~types'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  importAllFragmentsFrom?: string | FragmentImportFromFn;
  /**
   * @description Optional, sets a specific file name for the generated files. Use this to override the generated file name when generating files for example based on multiple .graphql files in separate directories.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts" {11}
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        preset: 'near-operation-file',
   *        plugins: ['typescript-operations', 'typescript-react-apollo'],
   *        presetConfig: {
   *          baseTypesPath: 'types.ts',
   *          fileName: 'index',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  fileName?: string;
  /**
   * @description Optional, sets the extension for the generated files. Use this to override the extension if you are using plugins that requires a different type of extensions (such as `typescript-react-apollo`)
   * @default .generated.ts
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts" {11}
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        preset: 'near-operation-file',
   *        plugins: ['typescript-operations', 'typescript-react-apollo'],
   *        presetConfig: {
   *          baseTypesPath: 'types.ts',
   *          extension: '.generated.tsx',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  extension?: string;
  /**
   * @description Optional, override the `cwd` of the execution. We are using `cwd` to figure out the imports between files. Use this if your execution path is not your project root directory.
   * @default process.cwd()
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts" {11}
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        preset: 'near-operation-file',
   *        plugins: ['typescript-operations'],
   *        presetConfig: {
   *          baseTypesPath: 'types.ts',
   *          cwd: '/some/path'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  cwd?: string;
  /**
   * @description Optional, defines a folder, (Relative to the source files) where the generated files will be created.
   * @default ''
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts" {11}
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        preset: 'near-operation-file',
   *        plugins: ['typescript-operations'],
   *        presetConfig: {
   *          baseTypesPath: 'types.ts',
   *          folder: '__generated__'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  folder?: string;
  /**
   * @description Optional, override the name of the import namespace used to import from the `baseTypesPath` file.
   * @default Types
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts" {11}
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        preset: 'near-operation-file',
   *        plugins: ['typescript-operations'],
   *        presetConfig: {
   *          baseTypesPath: 'types.ts',
   *          importTypesNamespace: 'SchemaTypes'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  importTypesNamespace?: string;
  /**
   * @description Optional, enables persisted operations support.
   * When enabled, it will generate a persisted-documents.json file containing operation hashes.
   * @default false
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts" { 11 }
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        preset: 'near-operation-file',
   *        plugins: ['typescript-operations'],
   *        presetConfig: {
   *          baseTypesPath: 'types.ts',
   *          persistedDocuments: {
   *            hashPropertyName: 'hash',
   *            mode: 'embedHashInDocument',
   *            hashAlgorithm: 'sha256'
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  persistedDocuments?:
    | boolean
    | {
        /**
         * @description Behavior for the output file.
         * @default 'embedHashInDocument'
         * "embedHashInDocument" will add a property within the `DocumentNode` with the hash of the operation.
         * "replaceDocumentWithHash" will fully drop the document definition.
         */
        mode?: 'embedHashInDocument' | 'replaceDocumentWithHash';
        /**
         * @description Name of the property that will be added to the `DocumentNode` with the hash of the operation.
         */
        hashPropertyName?: string;
        /**
         * @description Algorithm or function used to generate the hash, could be useful if your server expects something specific (e.g., Apollo Server expects `sha256`).
         *
         * A custom hash function can be provided to generate the hash if the preset algorithms don't fit your use case. The function receives the operation and should return the hash string.
         *
         * The algorithm parameter is typed with known algorithms and as a string rather than a union because it solely depends on Crypto's algorithms supported
         * by the version of OpenSSL on the platform.
         *
         * @default `sha1`
         */
        hashAlgorithm?: 'sha1' | 'sha256' | (string & {}) | ((operation: string) => string);
      };
};

export type FragmentNameToFile = {
  [fragmentName: string]: {
    location: string;
    importsNames: string[];
    onType: string;
    node: FragmentDefinitionNode;
  };
};

export const preset: Types.OutputPreset<NearOperationFileConfig> = {
  buildGeneratesSection: options => {
    const schemaObject: GraphQLSchema = options.schemaAst
      ? options.schemaAst
      : buildASTSchema(options.schema, options.config as any);
    const baseDir = options.presetConfig.cwd || process.cwd();
    const fileName = options.presetConfig.fileName || '';
    const extension = options.presetConfig.extension || '.generated.ts';
    const folder = options.presetConfig.folder || '';
    const importTypesNamespace = options.presetConfig.importTypesNamespace || 'Types';
    const importAllFragmentsFrom: FragmentImportFromFn | string | null =
      options.presetConfig.importAllFragmentsFrom || null;

    const { baseTypesPath } = options.presetConfig;

    if (!baseTypesPath) {
      throw new Error(
        `Preset "near-operation-file" requires you to specify "baseTypesPath" configuration and point it to your base types file (generated by "typescript" plugin)!`,
      );
    }

    const shouldAbsolute = !baseTypesPath.startsWith('~');

    const pluginMap: { [name: string]: CodegenPlugin } = {
      ...options.pluginMap,
      add: addPlugin,
    };

    const sources = resolveDocumentImports(
      options,
      schemaObject,
      {
        baseDir,
        generateFilePath(location: string) {
          const newFilePath = defineFilepathSubfolder(location, folder);

          return appendFileNameToFilePath(newFilePath, fileName, extension);
        },
        schemaTypesSource: {
          path: shouldAbsolute ? join(options.baseOutputDir, baseTypesPath) : baseTypesPath,
          namespace: importTypesNamespace,
        },
        typesImport: options.config.useTypeImports ?? false,
      },
      getConfigValue(options.config.dedupeFragments, false),
    );

    const filePathsMap = new Map<
      string,
      {
        importStatements: Set<string>;
        documents: Array<Source>;
        externalFragments: Array<
          LoadedFragment<{
            level: number;
          }>
        >;
        fragmentImports: Array<ImportDeclaration<FragmentImport>>;
      }
    >();

    for (const source of sources) {
      let record = filePathsMap.get(source.filename);
      if (record === undefined) {
        record = {
          importStatements: new Set(),
          documents: [],
          externalFragments: [],
          fragmentImports: [],
        };
        filePathsMap.set(source.filename, record);
      }

      for (const importStatement of source.importStatements) {
        record.importStatements.add(importStatement);
      }
      record.documents.push(...source.documents);
      record.externalFragments.push(...source.externalFragments);
      record.fragmentImports.push(...source.fragmentImports);
    }

    const artifacts: Array<Types.GenerateOptions> = [];
    const persistedDocumentsMap = new Map<string, string>();

    // Handle persisted documents configuration
    const persistedDocuments = options.presetConfig.persistedDocuments
      ? {
          hashPropertyName:
            (typeof options.presetConfig.persistedDocuments === 'object' &&
              options.presetConfig.persistedDocuments.hashPropertyName) ||
            'hash',
          omitDefinitions:
            (typeof options.presetConfig.persistedDocuments === 'object' &&
              options.presetConfig.persistedDocuments.mode) === 'replaceDocumentWithHash' || false,
          hashAlgorithm:
            (typeof options.presetConfig.persistedDocuments === 'object' &&
              options.presetConfig.persistedDocuments.hashAlgorithm) ||
            'sha1',
        }
      : null;

    for (const [filename, record] of filePathsMap.entries()) {
      let fragmentImportsArr = record.fragmentImports;

      if (importAllFragmentsFrom) {
        fragmentImportsArr = record.fragmentImports.map<ImportDeclaration<FragmentImport>>(t => {
          const newImportSource: ImportSource<FragmentImport> =
            typeof importAllFragmentsFrom === 'string'
              ? { ...t.importSource, path: importAllFragmentsFrom }
              : importAllFragmentsFrom(t.importSource, filename);

          return {
            ...t,
            importSource: newImportSource || t.importSource,
          };
        });
      }

      // Merge multiple fragment imports from the same file
      const fragmentImportsByImportSource: Record<string, ImportDeclaration<FragmentImport>> = {};
      fragmentImportsArr.forEach(fi => {
        if (!fragmentImportsByImportSource[fi.importSource.path]) {
          fragmentImportsByImportSource[fi.importSource.path] = fi;
        } else {
          const mergedIdentifiersByName = {};
          fragmentImportsByImportSource[fi.importSource.path].importSource.identifiers.forEach(
            identifier => {
              mergedIdentifiersByName[identifier.name] = identifier;
            },
          );
          fi.importSource.identifiers.forEach(identifier => {
            mergedIdentifiersByName[identifier.name] = identifier;
          });
          fragmentImportsByImportSource[fi.importSource.path].importSource.identifiers =
            Object.values(mergedIdentifiersByName);
        }
      });
      fragmentImportsArr = Object.values(fragmentImportsByImportSource);

      const plugins = [
        // TODO/NOTE I made globalNamespace include schema types - is that correct?
        ...(options.config.globalNamespace
          ? []
          : Array.from(record.importStatements).map(importStatement => ({
              add: { content: importStatement },
            }))),
        ...options.plugins,
      ];
      const config = {
        ...options.config,
        // This is set here in order to make sure the fragment spreads sub types
        // are exported from operations file
        exportFragmentSpreadSubTypes: true,
        namespacedImportName: importTypesNamespace,
        externalFragments: record.externalFragments,
        fragmentImports: fragmentImportsArr,
      };

      const document: DocumentNode = { kind: Kind.DOCUMENT, definitions: [] };
      const combinedSource: Source = {
        rawSDL: '',
        document,
        location: record.documents[0].location,
      };

      for (const source of record.documents) {
        combinedSource.rawSDL += source.rawSDL;
        (combinedSource.document.definitions as any).push(...source.document.definitions);
      }

      // Handle persisted documents
      if (persistedDocuments) {
        const documentString = normalizeAndPrintDocumentNode(combinedSource.document);
        const hash = generateDocumentHash(documentString, persistedDocuments.hashAlgorithm);
        persistedDocumentsMap.set(hash, documentString);

        if (!persistedDocuments.omitDefinitions) {
          // Add hash to document
          (combinedSource.document as any)[persistedDocuments.hashPropertyName] = hash;
        } else {
          // Replace document with hash
          combinedSource.document = {
            kind: Kind.DOCUMENT,
            definitions: [],
            [persistedDocuments.hashPropertyName]: hash,
          };
        }
      }

      artifacts.push({
        ...options,
        filename,
        documents: [combinedSource],
        plugins,
        pluginMap,
        config,
        schema: options.schema,
        schemaAst: schemaObject,
        skipDocumentsValidation:
          typeof options.config.skipDocumentsValidation === 'undefined'
            ? { skipDuplicateValidation: true }
            : options.config.skipDocumentsValidation,
      });
    }

    // Add persisted-documents.json if enabled
    if (persistedDocuments && persistedDocumentsMap.size > 0) {
      artifacts.push({
        filename: join(options.baseOutputDir, 'persisted-documents.json'),
        plugins: [
          {
            [`persisted-operations`]: {},
          },
        ],
        pluginMap: {
          [`persisted-operations`]: {
            plugin: async () => {
              //await tdnFinished.promise;
              return {
                content: JSON.stringify(Object.fromEntries(persistedDocumentsMap.entries()), null, 2),
              };
            },
          },
        },
        schema: options.schema,
        config: {},
        documents: [],
        skipDocumentsValidation: true,
      });
    }

    return artifacts;
  },
};

export default preset;
