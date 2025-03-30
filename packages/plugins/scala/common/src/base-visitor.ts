import autoBind from 'auto-bind';
import {
  DirectiveNode,
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  Kind,
  ObjectTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  TypeNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import {
  BaseVisitor,
  EnumValuesMap,
  indent,
  ParsedConfig,
  ParsedScalarsMap,
} from '@graphql-codegen/visitor-plugin-common';
import { ScalaPluginCommonRawConfig } from './config';

export interface ScalaResolverParsedConfig extends ParsedConfig {
  packageName: string;
  classMembersPrefix: string;
  scalars: ParsedScalarsMap;
  enumValues: EnumValuesMap;
  generateCompanionObjects: boolean;
  useOptions: boolean;
  className: string;
  listType: string;
  outputFile?: string;
  useOpaqueTypes: boolean;
}

export class ScalaBaseVisitor<
  TRawConfig extends ScalaPluginCommonRawConfig,
  TParsedConfig extends ScalaResolverParsedConfig,
> extends BaseVisitor<TRawConfig, TParsedConfig> {
  protected schema: GraphQLSchema;

  protected primitiveNames: string[] = ['ID', 'String', 'Int', 'Float', 'Boolean'];

  constructor(
    schema: GraphQLSchema,
    config: TRawConfig,
    rawConfig?: { outputFile?: string },
    defaultParsedConfig?: Partial<TParsedConfig>,
  ) {
    const defaultScalars = {
      ID: 'String',
      String: 'String',
      Boolean: 'Boolean',
      Int: 'Int',
      Float: 'Double',
      DateTime: 'java.time.LocalDateTime',
    };

    const scalarsMap: Record<string, any> = {};

    for (const scalarName in defaultScalars) {
      if (Object.prototype.hasOwnProperty.call(defaultScalars, scalarName)) {
        scalarsMap[scalarName] = {
          isExternal: false,
          type: defaultScalars[scalarName as keyof typeof defaultScalars],
        };
      }
    }

    if (config.scalars) {
      const customScalars = config.scalars as Record<string, string | Record<string, any>>;
      for (const scalarName in customScalars) {
        if (Object.prototype.hasOwnProperty.call(customScalars, scalarName)) {
          const scalarValue = customScalars[scalarName];
          if (typeof scalarValue === 'string') {
            scalarsMap[scalarName] = {
              isExternal: false,
              type: scalarValue,
            };
          } else if (typeof scalarValue === 'object') {
            scalarsMap[scalarName] = scalarValue;
          }
        }
      }
    }

    const parsedConfig: TParsedConfig = {
      ...(defaultParsedConfig || {}),
      packageName: config.packageName || 'graphql',
      classMembersPrefix: config.classMembersPrefix || '',
      scalars: scalarsMap as ParsedScalarsMap,
      enumValues: config.enumValues || {},
      generateCompanionObjects: config.generateCompanionObjects !== false,
      useOptions: config.useOptions === true,
      className: config.className || 'Types',
      listType: config.listType || 'List',
      outputFile: rawConfig?.outputFile,
      useOpaqueTypes: config.useOpaqueTypes === true,
    } as TParsedConfig;

    super(config, parsedConfig);

    this.schema = schema;
    autoBind(this);
  }

  public getPackage(): string {
    if (this.config.packageName) {
      return `package ${this.config.packageName}`;
    }

    const outputFile = (this.config.outputFile as string) || '';
    if (outputFile) {
      const pathParts = outputFile.split('/');
      pathParts.pop();

      if (pathParts.length > 0) {
        return `package ${pathParts.join('.')}`;
      }
    }

    return `package graphql`;
  }

  public getImports(): string {
    return '';
  }

  protected getScalaType(node: TypeNode): string {
    if (node.kind === Kind.NON_NULL_TYPE) {
      if (node.type.kind === Kind.LIST_TYPE) {
        return `${this.config.listType}[${this.getScalaType(node.type.type)}]`;
      }
      return this.getScalaTypeForName(node.type.name.value);
    }

    if (node.kind === Kind.LIST_TYPE) {
      return `${this.config.listType}[${this.getScalaType(node.type)}]`;
    }

    if (this.config.useOptions) {
      const typeName = this.getScalaTypeForName(node.name.value);
      if (typeName.startsWith('Option[')) {
        return typeName;
      }
      return `Option[${typeName}]`;
    }

    return this.getScalaTypeForName(node.name.value);
  }

  protected getScalaTypeForName(name: string): string {
    if (this.config.enumValues && this.config.enumValues[name]) {
      return this.config.enumValues[name] as string;
    }

    if (name === 'ID') {
      return 'String';
    }

    const scalar = this.config.scalars[name];

    if (typeof scalar === 'string') {
      return scalar;
    }

    if (scalar && typeof scalar === 'object') {
      if ('type' in scalar && typeof scalar.type === 'string') {
        return scalar.type;
      }
      if ('output' in scalar && typeof scalar.output === 'string') {
        return scalar.output;
      }
    }

    return name;
  }

  protected getTypeName(type: TypeNode): string {
    if (type.kind === Kind.LIST_TYPE) {
      return this.getTypeName(type.type);
    }
    if (type.kind === Kind.NON_NULL_TYPE) {
      return this.getTypeName(type.type);
    }
    return type.name.value;
  }

  protected isListType(type: TypeNode): boolean {
    if (type.kind === Kind.LIST_TYPE) {
      return true;
    }
    if (type.kind === Kind.NON_NULL_TYPE) {
      return this.isListType(type.type);
    }
    return false;
  }

  protected getPrimitiveType(typeName: string): string {
    switch (typeName) {
      case 'ID':
      case 'String':
        return 'String';
      case 'Int':
        return 'Int';
      case 'Float':
        return 'Double';
      case 'Boolean':
        return 'Boolean';
      default:
        return typeName;
    }
  }

  protected formatFieldName(name: string): string {
    return this.config.classMembersPrefix + name;
  }

  public ScalarTypeDefinition(node: ScalarTypeDefinitionNode): string {
    const name = node.name.value;

    if (this.config.scalars && name in this.config.scalars) {
      const scalar = this.config.scalars[name];
      if (typeof scalar === 'string') {
        return `type ${name} = ${scalar}`;
      } else if (typeof scalar === 'object') {
        if ('type' in scalar && typeof scalar.type === 'string') {
          return `type ${name} = ${scalar.type}`;
        }
        if ('output' in scalar && typeof scalar.output === 'string') {
          return `type ${name} = ${scalar.output}`;
        }
      }
    }

    // For any scalar that hasn't been explicitly configured,
    // return the default scalar mapping if it's a known type
    if (name === 'DateTime') {
      return `type ${name} = java.time.LocalDateTime`;
    }

    return `type ${name} = ${name}`;
  }

  public generateCustomScalars(skipScalarNames: string[] = []): string[] {
    const result: string[] = [];
    const hasCustomDateTime = this.config.scalars && this.config.scalars['DateTime'];

    if (this.config.scalars) {
      for (const scalarName in this.config.scalars) {
        if (
          Object.prototype.hasOwnProperty.call(this.config.scalars, scalarName) &&
          !this.primitiveNames.includes(scalarName)
        ) {
          const scalarMapper = this.config.scalars[scalarName];
          let scalarType: string;

          if (typeof scalarMapper === 'string') {
            scalarType = scalarMapper;
          } else if (typeof scalarMapper === 'object') {
            if ('type' in scalarMapper && typeof scalarMapper.type === 'string') {
              scalarType = scalarMapper.type;
            } else if ('output' in scalarMapper && typeof scalarMapper.output === 'string') {
              scalarType = scalarMapper.output;
            } else {
              scalarType = scalarName;
            }
          } else {
            scalarType = scalarName;
          }

          if (this.config.useOpaqueTypes) {
            result.push(`opaque type ${scalarName} = ${scalarType}

object ${scalarName}:
  def apply(value: ${scalarType}): ${scalarName} = value
  extension (x: ${scalarName})
    def value: ${scalarType} = x`);
          } else {
            result.push(`type ${scalarName} = ${scalarType}`);
          }
        }
      }
    }

    if (!hasCustomDateTime && !skipScalarNames.includes('DateTime')) {
      result.push('type DateTime = java.time.LocalDateTime');
    }

    return result;
  }

  public InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    const name = node.name.value;
    const comment = this.getTypeComment(node);
    const fields = node.fields || [];
    const fieldsContent = fields.map(field => this.buildInputObjectFieldString(field)).join(',\n');

    let content = comment + `case class ${name}(\n${fieldsContent}\n)`;
    content += this.generateInputObjectCompanionObject(node);
    return content;
  }

  public ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    const name = node.name.value;
    const comment = this.getTypeComment(node);
    const fields = node.fields || [];
    const interfaces = node.interfaces || [];
    const extensions = interfaces.length
      ? ` extends ${interfaces.map(i => i.name.value).join(', ')}`
      : '';

    const fieldsContent = fields.map(field => this.buildObjectFieldString(field)).join(',\n');

    let content = comment + `case class ${name}(\n${fieldsContent}\n)${extensions}`;
    content += this.generateObjectCompanionObject(node);
    return content;
  }

  public UnionTypeDefinition(node: UnionTypeDefinitionNode): string {
    const name = node.name.value;
    const possibleTypes = node.types || [];
    const comment = this.getTypeComment(node);

    let content = comment + `type ${name} = ${possibleTypes.map(t => t.name.value).join(' | ')}`;
    content += this.generateUnionCompanionObject(node);
    return content;
  }

  public InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): string {
    const name = node.name.value;
    const comment = this.getTypeComment(node);
    const fields = node.fields || [];

    let interfaceContent = comment + `trait ${name}:`;

    interfaceContent +=
      '\n' +
      fields
        .map(field => {
          const fieldType = this.getScalaType(field.type);
          const nameForField = this.formatFieldName(field.name.value);
          return indent(`def ${nameForField}: ${fieldType}`);
        })
        .join('\n');

    interfaceContent += this.generateInterfaceCompanionObject(node);
    return interfaceContent;
  }

  public EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const name = node.name.value;
    const comment = this.getTypeComment(node);
    const enumValues = node.values || [];

    let enumContent = comment + `enum ${name}:`;
    enumContent += '\n' + enumValues.map(enumValue => indent(`case ${enumValue.name.value}`)).join('\n');
    enumContent += this.generateEnumCompanionObject(node);
    return enumContent;
  }

  protected getTypeComment(node: {
    description?: { value: string };
    directives?: ReadonlyArray<DirectiveNode>;
  }): string {
    return '';
  }

  protected buildObjectFieldString(field: FieldDefinitionNode, prefix?: string): string {
    const fieldName = this.formatFieldName(field.name.value);
    const baseType = this.getTypeName(field.type);
    let fieldType = this.getScalaType(field.type);

    if (
      baseType === 'Int' &&
      typeof this.config.scalars['Int'] === 'string' &&
      this.config.scalars['Int'] === 'scala.Int'
    ) {
      if (this.isListType(field.type)) {
        fieldType = fieldType.replace('Int', 'scala.Int');
      } else {
        fieldType = 'scala.Int';
      }
    }

    if (baseType === 'DateTime' && !this.config.scalars['DateTime']) {
      fieldType = fieldType.replace('DateTime', 'java.time.LocalDateTime');
    }

    const isNullable = field.type.kind !== 'NonNullType';

    if (isNullable && this.config.useOptions) {
      if (fieldType.startsWith('Option[')) {
        return `${prefix || ''}${fieldName}: ${fieldType}`;
      }
      return `${prefix || ''}${fieldName}: Option[${fieldType}]`;
    }

    return `${prefix || ''}${fieldName}: ${fieldType}`;
  }

  protected buildInputObjectFieldString(field: InputValueDefinitionNode, prefix?: string): string {
    const fieldName = this.formatFieldName(field.name.value);
    const baseType = this.getTypeName(field.type);
    let fieldType = this.getScalaType(field.type);

    if (
      baseType === 'Int' &&
      typeof this.config.scalars['Int'] === 'string' &&
      this.config.scalars['Int'] === 'scala.Int'
    ) {
      if (this.isListType(field.type)) {
        fieldType = fieldType.replace('Int', 'scala.Int');
      } else {
        fieldType = 'scala.Int';
      }
    }

    if (baseType === 'DateTime' && !this.config.scalars['DateTime']) {
      fieldType = fieldType.replace('DateTime', 'java.time.LocalDateTime');
    }

    const isNullable = field.type.kind !== 'NonNullType';

    if (isNullable && this.config.useOptions) {
      if (fieldType.startsWith('Option[')) {
        return `${prefix || ''}${fieldName}: ${fieldType}`;
      }
      return `${prefix || ''}${fieldName}: Option[${fieldType}]`;
    }

    return `${prefix || ''}${fieldName}: ${fieldType}`;
  }

  protected getDefaultValueForType(type: TypeNode): string {
    if (type.kind === Kind.NON_NULL_TYPE) {
      return this.getDefaultValueForType(type.type);
    }

    if (type.kind === Kind.LIST_TYPE) {
      return `${this.config.listType}.empty`;
    }

    if (type.kind === Kind.NAMED_TYPE) {
      const typeName = type.name.value;

      switch (typeName) {
        case 'String':
          return '""';
        case 'Int':
          return '0';
        case 'Float':
          return '0.0';
        case 'Boolean':
          return 'false';
        case 'ID':
          return '""';
        case 'DateTime':
          return 'java.time.LocalDateTime.now()';
        default:
          return `null.asInstanceOf[${typeName}]`;
      }
    }

    return 'null';
  }

  protected wrapScalaValue(value: any, type: TypeNode): string {
    if (value === null) {
      return 'null';
    }

    if (typeof value === 'string') {
      return `"${value}"`;
    }

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    if (typeof value === 'number') {
      return String(value);
    }

    if (Array.isArray(value)) {
      const arrayItems = value.map(item => this.wrapScalaValue(item, type)).join(', ');
      return `List(${arrayItems})`;
    }

    if (typeof value === 'object') {
      if (value.kind === 'EnumValue') {
        const typeName = this.getTypeName(type);
        return `${typeName}.${value.value}`;
      }
    }

    return String(value);
  }

  protected generateInputObjectCompanionObject(node: InputObjectTypeDefinitionNode): string {
    if (!this.config.generateCompanionObjects) {
      return '';
    }

    const inputName = node.name.value;
    let content = `\n\nobject ${inputName}:`;

    return content;
  }

  protected generateObjectCompanionObject(node: ObjectTypeDefinitionNode): string {
    if (!this.config.generateCompanionObjects) {
      return '';
    }

    const objectName = node.name.value;
    let content = `\n\nobject ${objectName}:`;

    return content;
  }

  protected generateEnumCompanionObject(node: EnumTypeDefinitionNode): string {
    if (!this.config.generateCompanionObjects) {
      return '';
    }

    const enumName = node.name.value;
    let enumContent = `\n\nobject ${enumName}:`;
    enumContent += '\n' + indent(`def fromString(value: String): Option[${enumName}] =`);
    enumContent += '\n' + indent(indent(`Try {`));
    enumContent += '\n' + indent(indent(indent(`${enumName}.valueOf(value)`)));
    enumContent += '\n' + indent(indent(`}.toOption`));
    return enumContent;
  }

  protected generateUnionCompanionObject(node: UnionTypeDefinitionNode): string {
    if (!this.config.generateCompanionObjects) {
      return '';
    }

    const name = node.name.value;
    const types = node.types || [];
    const typeNames = types.map(t => t.name.value);
    let content = `\n\nobject ${name}:`;

    for (const typeName of typeNames) {
      content += '\n' + indent(`def as${typeName}(union: ${name}): Option[${typeName}] =`);
      content += '\n' + indent(indent(`union match`));
      content += '\n' + indent(indent(indent(`case value: ${typeName} => Some(value)`)));
      content += '\n' + indent(indent(indent(`case _ => None`)));
    }

    return content;
  }

  protected generateInterfaceCompanionObject(node: InterfaceTypeDefinitionNode): string {
    if (!this.config.generateCompanionObjects) {
      return '';
    }

    const interfaceName = node.name.value;
    return `\n\nobject ${interfaceName}:`;
  }
}
