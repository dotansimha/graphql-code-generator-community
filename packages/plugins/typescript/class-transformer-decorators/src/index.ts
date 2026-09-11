import generate from '@babel/generator';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import { plugin as typescriptPlugin } from '@graphql-codegen/typescript';
import { ClassTransformerDecoratorConfig } from './config';

export const plugin: PluginFunction<ClassTransformerDecoratorConfig> = async (
  schema,
  documents,
  config,
) => {
  // Generate the initial TypeScript code using the default TypeScript plugin
  const generatedTS = await typescriptPlugin(schema, documents, config);
  const generatedContent = generatedTS.content || '';

  // Parse the generated TypeScript code into an AST
  const ast = parser.parse(generatedContent, {
    sourceType: 'module',
    plugins: ['typescript', 'classProperties', 'classPrivateProperties', 'decorators-legacy'],
  });

  // Get the class whitelist and class name pattern from the plugin config
  const classWhitelist = config.classWhitelist || [];
  const classNamePattern = config.classNamePattern || null; // Default to null if not provided
  let classNameRegex = null;

  if (classNamePattern) {
    classNameRegex = new RegExp(classNamePattern);
  }

  // Collect all class names to identify custom types
  const classNames = new Set();
  traverse(ast, {
    ClassDeclaration(path) {
      classNames.add(path.node.id.name);
    },
  });

  // Traverse the AST and add decorators
  traverse(ast, {
    ClassDeclaration(classPath) {
      const className = classPath.node.id.name;

      // Determine if the class should be processed
      const isWhitelisted = classWhitelist.includes(className);
      const matchesPattern = classNameRegex ? classNameRegex.test(className) : false;

      // Skip classes that are neither whitelisted nor matching the pattern
      if (!isWhitelisted && !matchesPattern) {
        return; // Skip this class
      }

      classPath
        .get('body')
        .get('body')
        .forEach(classElementPath => {
          // Check if it's a class property
          if (
            classElementPath.isClassProperty() ||
            classElementPath.isTSDeclareMethod() ||
            classElementPath.isTSPropertySignature()
          ) {
            // Add @Expose() decorator to the class property
            const exposeDecorator = t.decorator(t.callExpression(t.identifier('Expose'), []));
            classElementPath.node.decorators = classElementPath.node.decorators || [];
            classElementPath.node.decorators.push(exposeDecorator);

            // Process type annotation to add @Type() decorator for custom types
            const typeAnnotationNode = (classElementPath.node as any).typeAnnotation;

            if (typeAnnotationNode && typeAnnotationNode.typeAnnotation) {
              const typeName = getTypeName(typeAnnotationNode.typeAnnotation);
              if (typeName && classNames.has(typeName)) {
                // Add @Type(() => TypeName) decorator
                const typeDecorator = t.decorator(
                  t.callExpression(t.identifier('Type'), [
                    t.arrowFunctionExpression([], t.identifier(typeName)),
                  ]),
                );
                classElementPath.node.decorators.push(typeDecorator);
              }
            }
          }
        });
    },
  });

  // Generate the modified code from the AST
  const { code: modifiedContent } = generate(ast, {}, generatedContent);

  // Add the import statement for Expose and Type
  const importExpose = `import 'reflect-metadata';\nimport { Expose, Type } from 'class-transformer';`;
  const prependContent = (generatedTS.prepend || []).join('\n');

  return {
    prepend: [importExpose],
    content: `${prependContent}\n${modifiedContent}`,
  };
};

function getTypeName(typeAnnotation: any): string | null {
  switch (typeAnnotation.type) {
    case 'TSTypeReference':
      if (typeAnnotation.typeParameters && typeAnnotation.typeParameters.params.length > 0) {
        for (const param of typeAnnotation.typeParameters.params) {
          const typeName = getTypeName(param);
          if (typeName) {
            return typeName;
          }
        }
      } else if (typeAnnotation.typeName.type === 'Identifier') {
        return typeAnnotation.typeName.name;
      } else if (typeAnnotation.typeName.type === 'TSQualifiedName') {
        return typeAnnotation.typeName.right.name;
      }
      break;
    case 'TSUnionType':
    case 'TSIntersectionType':
      for (const type of typeAnnotation.types) {
        const typeName = getTypeName(type);
        if (typeName) {
          return typeName;
        }
      }
      break;
    case 'TSArrayType':
      return getTypeName(typeAnnotation.elementType);
    case 'TSParenthesizedType':
      return getTypeName(typeAnnotation.typeAnnotation);
    default:
      return null;
  }
  return null;
}
