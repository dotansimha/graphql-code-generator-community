import { join } from 'path';
import { DocumentNode, FragmentDefinitionNode, FragmentSpreadNode } from 'graphql';
import parsePath from 'parse-filepath';
import { oldVisit } from '@graphql-codegen/plugin-helpers';
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

export function extractExternalFragmentsInUse(
  documentNode: DocumentNode | FragmentDefinitionNode,
  fragmentNameToFile: FragmentRegistry,
  result: { [fragmentName: string]: number } = {},
  level = 0,
): { [fragmentName: string]: number } {
  const ignoreList: Set<string> = new Set();

  // First, take all fragments definition from the current file, and mark them as ignored
  oldVisit(documentNode, {
    enter: {
      FragmentDefinition: (node: FragmentDefinitionNode) => {
        ignoreList.add(node.name.value);
      },
    },
  });

  // Then, look for all used fragments in this document
  oldVisit(documentNode, {
    enter: {
      FragmentSpread: (node: FragmentSpreadNode) => {
        if (
          !ignoreList.has(node.name.value) &&
          (result[node.name.value] === undefined || level < result[node.name.value])
        ) {
          result[node.name.value] = level;

          if (fragmentNameToFile[node.name.value]) {
            extractExternalFragmentsInUse(
              fragmentNameToFile[node.name.value].node,
              fragmentNameToFile,
              result,
              level + 1,
            );
          }
        }
      },
    },
  });

  return result;
}
