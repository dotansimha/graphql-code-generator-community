import { dirname, normalize } from 'path';
import { GraphQLSchema } from 'graphql';
import { buildPackageNameFromPath } from '@graphql-codegen/java-common';
import {
  getCachedDocumentNodeFromSchema,
  oldVisit,
  PluginFunction,
  Types,
} from '@graphql-codegen/plugin-helpers';
import { KotlinResolversPluginRawConfig } from './config.js';
import { KotlinResolversVisitor } from './visitor.js';

export const plugin: PluginFunction<KotlinResolversPluginRawConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: KotlinResolversPluginRawConfig,
  { outputFile },
): Promise<string> => {
  const relevantPath = dirname(normalize(outputFile));
  const defaultPackageName = buildPackageNameFromPath(relevantPath);
  const visitor = new KotlinResolversVisitor(config, schema, defaultPackageName);
  const astNode = getCachedDocumentNodeFromSchema(schema);
  const visitorResult = oldVisit(astNode, { leave: visitor as any });
  const packageName = visitor.getPackageName();
  let blockContent = visitorResult.definitions.filter(d => typeof d === 'string').join('\n\n');

  // Add Jakarta Validation imports if validation annotations are enabled
  if (config.validationAnnotations && blockContent.includes('@field:')) {
    const packageRegex = /(package\s+[^\n]+)/;
    const match = blockContent.match(packageRegex);
    if (match) {
      blockContent = blockContent.replace(
        packageRegex,
        `${match[1]}\n\nimport jakarta.validation.constraints.*`
      );
    } else {
      blockContent = `import jakarta.validation.constraints.*\n\n${blockContent}`;
    }
  }

  return [packageName, blockContent].join('\n');
};
