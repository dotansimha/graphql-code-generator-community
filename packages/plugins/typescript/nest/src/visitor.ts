import autoBind from 'auto-bind';
import {
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  GraphQLEnumType,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  TypeDefinitionNode,
  TypeNode,
} from 'graphql';
import {
  TsVisitor,
  TypeScriptOperationVariablesToObject,
  TypeScriptPluginParsedConfig,
} from '@graphql-codegen/typescript';
import { DeclarationBlock, getConfigValue, indent } from '@graphql-codegen/visitor-plugin-common';
import { NestPluginConfig } from './config';
import {
  ARRAY_REGEX,
  FIX_DECORATOR_SIGNATURE,
  GRAPHQL_TYPES,
  MAYBE_REGEX,
  NEST_PREFIX,
  NEST_SCALARS,
  SCALAR_REGEX,
  SCALARS,
} from './constants';
import { DecoratorConfig, DecoratorOptions, Type } from './types';
import {
  buildTypeString,
  escapeString,
  fixDecorator,
  formatDecoratorOptions,
  getNestNullableValue,
} from './utils';

export interface NestPluginParsedConfig extends TypeScriptPluginParsedConfig {
  disableDescriptions: boolean;
  decoratorName: DecoratorConfig;
  decorateTypes?: string[];
}

export class NestVisitor<
  TRawConfig extends NestPluginConfig = NestPluginConfig,
  TParsedConfig extends NestPluginParsedConfig = NestPluginParsedConfig,
> extends TsVisitor<TRawConfig, TParsedConfig> {
  private typescriptVisitor: TsVisitor<TRawConfig, TParsedConfig>;

  constructor(
    schema: GraphQLSchema,
    pluginConfig: TRawConfig,
    additionalConfig: Partial<TParsedConfig> = {},
  ) {
    super(schema, pluginConfig, {
      avoidOptionals: getConfigValue(pluginConfig.avoidOptionals, false),
      maybeValue: getConfigValue(pluginConfig.maybeValue, 'T | null'),
      constEnums: getConfigValue(pluginConfig.constEnums, false),
      enumsAsTypes: getConfigValue(pluginConfig.enumsAsTypes, false),
      immutableTypes: getConfigValue(pluginConfig.immutableTypes, false),
      declarationKind: {
        type: 'class',
        interface: 'abstract class',
        arguments: 'class',
        input: 'class',
        scalar: 'type',
      },
      decoratorName: {
        type: 'ObjectType',
        interface: 'InterfaceType',
        arguments: 'ArgsType',
        field: 'Field',
        input: 'InputType',
        ...pluginConfig.decoratorName,
      },
      decorateTypes: getConfigValue(pluginConfig.decorateTypes, undefined),
      disableDescriptions: getConfigValue(pluginConfig.disableDescriptions, false),
      ...additionalConfig,
    });
    autoBind(this);

    this.typescriptVisitor = new TsVisitor<TRawConfig, TParsedConfig>(
      schema,
      pluginConfig,
      additionalConfig,
    );

    const enumNames = Object.values(schema.getTypeMap())
      .map(type => (type instanceof GraphQLEnumType ? type.name : undefined))
      .filter(t => t);
    this.setArgumentsTransformer(
      new TypeScriptOperationVariablesToObject(
        this.scalars,
        this.convertName,
        this.config.avoidOptionals,
        this.config.immutableTypes,
        null,
        enumNames,
        this.config.enumPrefix,
        this.config.enumValues,
        undefined,
        undefined,
        'Maybe',
      ),
    );
    this.setDeclarationBlockConfig({
      enumNameValueSeparator: ' =',
    });
  }

  getBaseDecoratorOptions(
    node:
      | ObjectTypeDefinitionNode
      | InterfaceTypeDefinitionNode
      | FieldDefinitionNode
      | InputObjectTypeDefinitionNode
      | InputValueDefinitionNode,
  ): DecoratorOptions {
    const decoratorOptions: DecoratorOptions = {};

    if (node.description) {
      // If we have a description, add it to the decorator options
      decoratorOptions.description = escapeString(
        typeof node.description === 'string' ? node.description : node.description.value,
      );
    }

    return decoratorOptions;
  }

  public getWrapperDefinitions(): string[] {
    return [...super.getWrapperDefinitions(), this.getFixDecoratorDefinition()];
  }

  public getFixDecoratorDefinition(): string {
    return `${this.getExportPrefix()}${FIX_DECORATOR_SIGNATURE}`;
  }

  getMaybeWrapper(): string {
    return 'Maybe';
  }

  protected buildArgumentsBlock(
    node: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode,
  ): string {
    const fieldsWithArguments =
      node.fields.filter(field => field.arguments && field.arguments.length > 0) || [];

    return fieldsWithArguments
      .map(field => {
        const name =
          node.name.value +
          (this.config.addUnderscoreToArgsType ? '_' : '') +
          this.convertName(field, {
            useTypesPrefix: false,
            useTypesSuffix: false,
          }) +
          'Args';

        if (this.shouldBeDecorated(name)) {
          return this.getArgumentsObjectTypeDefinition(node, name, field);
        }
        return this.typescriptVisitor.getArgumentsObjectTypeDefinition(node, name, field);
      })
      .join('\n\n');
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: string | number, parent: any): string {
    const nodeName = typeof node.name === 'string' ? node.name : node.name.value;
    const isGraphQLType = GRAPHQL_TYPES.includes(nodeName);
    if (!isGraphQLType && !this.shouldBeDecorated(nodeName)) {
      return this.typescriptVisitor.ObjectTypeDefinition(node, key, parent);
    }

    const typeDecorator = this.config.decoratorName.type;
    const originalNode = parent[key] as ObjectTypeDefinitionNode;

    const decoratorOptions = this.getBaseDecoratorOptions(originalNode);

    let declarationBlock: DeclarationBlock;
    if (isGraphQLType) {
      declarationBlock = this.typescriptVisitor.getObjectTypeDeclarationBlock(node, originalNode);
    } else {
      declarationBlock = this.getObjectTypeDeclarationBlock(node, originalNode);

      // Add decorator
      const interfaces = originalNode.interfaces?.map(i => this.convertName(i)) || [];
      if (interfaces.length > 1) {
        decoratorOptions.implements = `[${interfaces.join(', ')}]`;
      } else if (interfaces.length === 1) {
        decoratorOptions.implements = interfaces[0];
      }

      declarationBlock = declarationBlock.withDecorator(
        `@${NEST_PREFIX}.${typeDecorator}(${formatDecoratorOptions(decoratorOptions)})`,
      );
    }

    // Remove comment added by typescript plugin
    declarationBlock._comment = undefined;

    return [declarationBlock.string, this.buildArgumentsBlock(originalNode)]
      .filter(f => f)
      .join('\n\n');
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    if (!this.shouldBeDecorated(typeof node.name === 'string' ? node.name : node.name.value)) {
      return this.typescriptVisitor.InputObjectTypeDefinition(node);
    }

    const typeDecorator = this.config.decoratorName.input;
    const decoratorOptions = this.getBaseDecoratorOptions(node);
    const declarationBlock = this.getInputObjectDeclarationBlock(node).withDecorator(
      `@${NEST_PREFIX}.${typeDecorator}(${formatDecoratorOptions(decoratorOptions)})`,
    );

    return declarationBlock.string;
  }

  getArgumentsObjectDeclarationBlock(
    node: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode,
    name: string,
    field: FieldDefinitionNode,
  ): DeclarationBlock {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.arguments)
      .withName(this.convertName(name))
      .withComment(node.description)
      .withBlock(field.arguments.map(argument => this.InputValueDefinition(argument)).join('\n'));
  }

  getArgumentsObjectTypeDefinition(
    node: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode,
    name: string,
    field: FieldDefinitionNode,
  ): string {
    const typeDecorator = this.config.decoratorName.arguments;

    const declarationBlock = this.getArgumentsObjectDeclarationBlock(
      node,
      name,
      field,
    ).withDecorator(`@${NEST_PREFIX}.${typeDecorator}()`);
    return declarationBlock.string;
  }

  InterfaceTypeDefinition(
    node: InterfaceTypeDefinitionNode,
    key: string | number,
    parent: any,
  ): string {
    if (!this.shouldBeDecorated(typeof node.name === 'string' ? node.name : node.name.value)) {
      return this.typescriptVisitor.InterfaceTypeDefinition(node, key, parent);
    }

    const interfaceDecorator = this.config.decoratorName.interface;
    const originalNode = parent[key] as InterfaceTypeDefinitionNode;

    const decoratorOptions = this.getBaseDecoratorOptions(originalNode);
    const declarationBlock = this.getInterfaceTypeDeclarationBlock(
      node,
      originalNode,
    ).withDecorator(
      `@${NEST_PREFIX}.${interfaceDecorator}(${formatDecoratorOptions(decoratorOptions)})`,
    );

    return [declarationBlock.string, this.buildArgumentsBlock(originalNode)]
      .filter(f => f)
      .join('\n\n');
  }

  protected shouldBeDecorated(name: string): boolean {
    if (GRAPHQL_TYPES.includes(name)) {
      return false;
    }

    if (!this.config.decorateTypes) {
      return true;
    }

    return this.config.decorateTypes.includes(name);
  }

  parseType(type: TypeNode | string): Type {
    if (typeof type === 'string') {
      const isNullable = !!type.match(MAYBE_REGEX);
      const nonNullableType = type.replace(MAYBE_REGEX, '$1');
      const isArray = !!nonNullableType.match(ARRAY_REGEX);
      const singularType = nonNullableType.replace(ARRAY_REGEX, '$1');
      const isSingularTypeNullable = !!singularType.match(MAYBE_REGEX);
      const singularNonNullableType = singularType.replace(MAYBE_REGEX, '$1');
      const isScalar = !!singularNonNullableType.match(SCALAR_REGEX);
      const resolvedType = singularNonNullableType.replace(SCALAR_REGEX, (_match, type) => {
        if (NEST_SCALARS.includes(type)) {
          return `${NEST_PREFIX}.${type}`;
        }
        if (global[type]) {
          return type;
        }
        if (this.scalars[type]) {
          return this.scalars[type];
        }
        throw new Error(`Unknown scalar type ${type}`);
      });

      return {
        type: resolvedType,
        isNullable,
        isArray,
        isScalar,
        isItemsNullable: isArray && isSingularTypeNullable,
      };
    } else {
      const typeNode = type as TypeNode;
      if (typeNode.kind === 'NamedType') {
        return {
          type: typeNode.name.value,
          isNullable: true,
          isArray: false,
          isItemsNullable: false,
          isScalar: SCALARS.includes(typeNode.name.value),
        };
      }
      if (typeNode.kind === 'NonNullType') {
        return {
          ...this.parseType(typeNode.type),
          isNullable: false,
        };
      }
      if (typeNode.kind === 'ListType') {
        return {
          ...this.parseType(typeNode.type),
          isArray: true,
          isNullable: true,
        };
      }
    }

    throw new Error(`Unknown type ${type}`);
  }

  FieldDefinition(
    node: FieldDefinitionNode,
    key?: string | number,
    parent?: any,
    _path?: any,
    ancestors?: TypeDefinitionNode[],
  ): string {
    const parentName = ancestors?.[ancestors.length - 1]?.name?.value;
    if (!this.shouldBeDecorated(parentName)) {
      return this.typescriptVisitor.FieldDefinition(node, key, parent);
    }

    const fieldDecorator = this.config.decoratorName.field;
    let typeString = node.type as unknown as string;
    const type = this.parseType(typeString);
    const decoratorOptions = this.getBaseDecoratorOptions(node);

    const nullableValue = getNestNullableValue(type);
    if (nullableValue) {
      decoratorOptions.nullable = nullableValue;
    }

    const decorator =
      '\n' +
      indent(
        `@${NEST_PREFIX}.${fieldDecorator}(type => ${
          type.isArray ? `[${type.type}]` : type.type
        }${formatDecoratorOptions(decoratorOptions, false)})`,
      ) +
      '\n';

    typeString = fixDecorator(type, typeString);

    return (
      decorator +
      indent(
        `${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${
          type.isNullable ? '?' : '!'
        }: ${typeString};`,
      )
    );
  }

  InputValueDefinition(
    node: InputValueDefinitionNode,
    key?: string | number,
    parent?: any,
    path?: (string | number)[],
    ancestors?: TypeDefinitionNode[],
  ): string {
    const parentName = ancestors?.[ancestors.length - 1].name.value;
    if (parent && !this.shouldBeDecorated(parentName)) {
      return this.typescriptVisitor.InputValueDefinition(node, key, parent, path, ancestors);
    }

    const fieldDecorator = this.config.decoratorName.field;
    const rawType = node.type as TypeNode | string;
    const type = this.parseType(rawType);
    const nestType =
      type.isScalar && NEST_SCALARS.includes(type.type) ? `${NEST_PREFIX}.${type.type}` : type.type;

    const decoratorOptions = this.getBaseDecoratorOptions(node);

    const nullableValue = getNestNullableValue(type);
    if (nullableValue) {
      decoratorOptions.nullable = nullableValue;
    }

    const decorator =
      '\n' +
      indent(
        `@${NEST_PREFIX}.${fieldDecorator}(type => ${
          type.isArray ? `[${nestType}]` : nestType
        }${formatDecoratorOptions(decoratorOptions, false)})`,
      ) +
      '\n';

    const nameString = node.name.kind ? node.name.value : node.name;
    const typeString = (rawType as TypeNode).kind
      ? buildTypeString(type)
      : fixDecorator(type, rawType as string);

    return (
      decorator +
      indent(
        `${this.config.immutableTypes ? 'readonly ' : ''}${nameString}${
          type.isNullable ? '?' : '!'
        }: ${typeString};`,
      )
    );
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    if (!this.shouldBeDecorated(typeof node.name === 'string' ? node.name : node.name.value)) {
      return this.typescriptVisitor.EnumTypeDefinition(node);
    }

    return (
      super.EnumTypeDefinition(node) +
      `${NEST_PREFIX}.registerEnumType(${this.convertName(node)}, { name: '${this.convertName(
        node,
      )}' });\n`
    );
  }
}
